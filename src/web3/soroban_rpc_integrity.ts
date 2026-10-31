/**
 * AgentSentinel - JSON-RPC Response Signature and Hash Integrity Verifier
 * Verifies RPC response state hashes and signatures to detect malicious MITM proxies
 * or tampered ledger state responses from compromised RPC endpoints.
 */

import { SentinelRule, ToolCallContext, RuleViolation, Verdict, ToolCategory } from '../types.js';

export interface SorobanRpcIntegrityConfig {
  enforceStateHash?: boolean;
}

export function createSorobanRpcIntegrityVerifierRule(config: SorobanRpcIntegrityConfig = {}): SentinelRule {
  const enforce = config.enforceStateHash ?? true;

  return {
    id: 'soroban-rpc-integrity-verifier',
    name: 'Soroban JSON-RPC Integrity Verifier',
    category: 'custom' as ToolCategory,
    priority: 88,
    enabled: true,

    evaluate(context: ToolCallContext): RuleViolation | null {
      const tool = context.toolName.toLowerCase();
      if (!tool.includes('rpc') && !tool.includes('response') && !tool.includes('soroban')) {
        return null;
      }

      const params = context.params || {};
      const expectedHash = params.expectedStateHash || params.expectedHash;
      const responseHash = params.responseStateHash || params.actualHash || params.stateRoot;

      if (expectedHash && responseHash && expectedHash !== responseHash) {
        return {
          ruleId: 'soroban-rpc-integrity-verifier',
          ruleName: 'Soroban JSON-RPC Integrity Verifier',
          severity: 'critical',
          verdict: Verdict.BLOCK,
          reason: `RPC state hash mismatch detected! Expected (${expectedHash}) but received (${responseHash}). Endpoint may be compromised or spoofed.`,
          detectedPattern: `RPC_HASH_MISMATCH:${expectedHash}!=${responseHash}`,
        };
      }

      const signatureValid = params.signatureValid !== undefined ? Boolean(params.signatureValid) : true;
      if (!signatureValid) {
        return {
          ruleId: 'soroban-rpc-integrity-verifier',
          ruleName: 'Soroban JSON-RPC Integrity Verifier',
          severity: 'critical',
          verdict: Verdict.BLOCK,
          reason: 'RPC response cryptographic signature verification failed. Forged ledger state detected.',
          detectedPattern: 'RPC_SIGNATURE_INVALID',
        };
      }

      return null;
    }
  };
}
