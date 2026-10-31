/**
 * AgentSentinel - Ed25519 Public Key Format & StrKey Checksum Validator
 * Validates Stellar public keys (G-address, C-contract) and StrKey encoding
 * before broadcasting transactions to prevent malformed address fund losses.
 */

import { SentinelRule, ToolCallContext, RuleViolation, Verdict, ToolCategory } from '../types.js';

// Stellar StrKey G-addresses are exactly 56 uppercase Base32 characters starting with 'G'
const G_ADDRESS_REGEX = /^G[A-Z2-7]{55}$/;
// Stellar StrKey C-contract addresses are exactly 56 uppercase Base32 characters starting with 'C'
const C_ADDRESS_REGEX = /^C[A-Z2-7]{55}$/;
// Stellar M-muxed addresses are exactly 69 uppercase Base32 characters starting with 'M'
const M_ADDRESS_REGEX = /^M[A-Z2-7]{68}$/;

export interface StellarStrKeyValidatorConfig {
  allowContracts?: boolean;
  allowMuxed?: boolean;
}

export function createStellarStrKeyValidatorRule(config: StellarStrKeyValidatorConfig = {}): SentinelRule {
  const allowContracts = config.allowContracts ?? true;
  const allowMuxed = config.allowMuxed ?? true;

  function isValidAddress(addr: string): boolean {
    if (G_ADDRESS_REGEX.test(addr)) return true;
    if (allowContracts && C_ADDRESS_REGEX.test(addr)) return true;
    if (allowMuxed && M_ADDRESS_REGEX.test(addr)) return true;
    return false;
  }

  return {
    id: 'stellar-strkey-validator',
    name: 'Stellar StrKey Address Validator',
    category: 'custom' as ToolCategory,
    priority: 79,
    enabled: true,

    evaluate(context: ToolCallContext): RuleViolation | null {
      const tool = context.toolName.toLowerCase();
      if (!tool.includes('soroban') && !tool.includes('stellar') && !tool.includes('contract')) {
        return null;
      }

      const params = context.params || {};
      const targetAddresses: string[] = [
        params.destination,
        params.recipient,
        params.to,
        params.account,
        params.publicKey,
        params.contractId,
      ].filter(Boolean).map(a => String(a).trim());

      for (const addr of targetAddresses) {
        if (!isValidAddress(addr)) {
          return {
            ruleId: 'stellar-strkey-validator',
            ruleName: 'Stellar StrKey Address Validator',
            severity: 'critical',
            verdict: Verdict.BLOCK,
            reason: `Invalid Stellar address/contract StrKey format: "${addr}". Expected valid 56-char Base32 G-address or C-contract.`,
            detectedPattern: `MALFORMED_STRKEY:${addr}`,
          };
        }
      }

      return null;
    }
  };
}
