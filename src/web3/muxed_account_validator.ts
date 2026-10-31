/**
 * AgentSentinel - SEP-23 Muxed Account (M-Address) Validator
 * Validates SEP-23 multiplexed addresses and enforces 64-bit ID bounds
 * to prevent customer fund misdirection and integer overflow exploits.
 */

import { SentinelRule, ToolCallContext, RuleViolation, Verdict, ToolCategory } from '../types.js';

export const MAX_UINT64 = BigInt('18446744073709551615');

export function createMuxedAccountValidatorRule(): SentinelRule {
  return {
    id: 'muxed-account-validator',
    name: 'SEP-23 Muxed Account Validator',
    category: 'custom' as ToolCategory,
    priority: 85,
    enabled: true,

    evaluate(context: ToolCallContext): RuleViolation | null {
      const tool = context.toolName.toLowerCase();
      if (!tool.includes('stellar') && !tool.includes('transfer') && !tool.includes('pay') && !tool.includes('muxed')) {
        return null;
      }

      const params = context.params || {};
      const destination = String(params.to || params.destination || params.recipient || params.muxedAccount || '');

      if (!destination.startsWith('M')) {
        return null; // Standard G-address or Soroban contract address
      }

      // M-address is base32 encoded string starting with 'M' (69-75 characters)
      if (destination.length < 56 || destination.length > 75 || !/^M[A-Z2-7]+$/.test(destination)) {
        return {
          ruleId: 'muxed-account-validator',
          ruleName: 'SEP-23 Muxed Account Validator',
          severity: 'high',
          verdict: Verdict.BLOCK,
          reason: `Invalid SEP-23 Muxed Account encoding: "${destination}". Expected base32 StrKey starting with 'M'.`,
          detectedPattern: `MALFORMED_MUXED_ADDRESS:${destination}`
        };
      }

      const memoIdRaw = params.memoId ?? params.subAccountId;
      if (memoIdRaw !== undefined && memoIdRaw !== null) {
        try {
          const id = BigInt(memoIdRaw);
          if (id < 0n || id > MAX_UINT64) {
            return {
              ruleId: 'muxed-account-validator',
              ruleName: 'SEP-23 Muxed Account Validator',
              severity: 'critical',
              verdict: Verdict.BLOCK,
              reason: `Muxed account 64-bit subaccount ID overflow: value ${id} is outside valid range [0, 2^64-1].`,
              detectedPattern: `MUXED_ID_OVERFLOW:${id}`
            };
          }
        } catch {
          return {
            ruleId: 'muxed-account-validator',
            ruleName: 'SEP-23 Muxed Account Validator',
            severity: 'high',
            verdict: Verdict.BLOCK,
            reason: `Invalid memo ID formatting: "${memoIdRaw}". Expected integer.`,
            detectedPattern: `INVALID_MEMO_ID_FORMAT:${memoIdRaw}`
          };
        }
      }

      return null;
    }
  };
}
