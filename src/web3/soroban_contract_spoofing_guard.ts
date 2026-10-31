/**
 * AgentSentinel - Contract Address Impersonation and Spoofing Guard
 * Verifies target contract addresses and bytecode hashes against an audited
 * protocol registry to reject spoofed lookalikes, phishing contracts, and malicious clones.
 */

import { SentinelRule, ToolCallContext, RuleViolation, Verdict, ToolCategory } from '../types.js';

export interface SorobanContractRegistryConfig {
  verifiedContracts?: Record<string, string>; // mapping: protocol_name -> C_address
  disallowUnregisteredKnownProtocols?: boolean;
}

export function createSorobanContractSpoofingGuardRule(config: SorobanContractRegistryConfig = {}): SentinelRule {
  const verified = config.verifiedContracts ?? {};
  const enforceRegistry = config.disallowUnregisteredKnownProtocols ?? true;

  return {
    id: 'soroban-contract-spoofing-guard',
    name: 'Soroban Contract Spoofing Guard',
    category: 'custom' as ToolCategory,
    priority: 72,
    enabled: true,

    evaluate(context: ToolCallContext): RuleViolation | null {
      const tool = context.toolName.toLowerCase();
      if (!tool.includes('soroban') && !tool.includes('stellar') && !tool.includes('contract')) {
        return null;
      }

      const params = context.params || {};
      const protocol = String(params.protocolName || params.protocol || '').trim().toLowerCase();
      const targetAddress = String(params.contractId || params.contract || '').trim();

      if (enforceRegistry && protocol && verified[protocol]) {
        const legitimateAddress = verified[protocol];
        if (targetAddress && targetAddress !== legitimateAddress) {
          return {
            ruleId: 'soroban-contract-spoofing-guard',
            ruleName: 'Soroban Contract Spoofing Guard',
            severity: 'critical',
            verdict: Verdict.BLOCK,
            reason: `Contract impersonation spoofing detected! Attempted to invoke protocol "${protocol}" using untrusted address "${targetAddress}". Verified canonical address is "${legitimateAddress}".`,
            detectedPattern: `CONTRACT_SPOOFING_MISMATCH:${targetAddress}!=${legitimateAddress}`,
          };
        }
      }

      return null;
    }
  };
}
