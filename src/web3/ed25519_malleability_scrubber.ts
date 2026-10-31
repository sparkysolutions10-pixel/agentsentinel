/**
 * AgentSentinel - Ed25519 Signature Malleability Scrubber
 * Enforces canonical scalar bounds (0 <= S < L) on Ed25519 signatures
 * to prevent transaction hash mutation and replay vulnerabilities.
 */

import { SentinelRule, ToolCallContext, RuleViolation, Verdict, ToolCategory } from '../types.js';

// Ed25519 curve order L = 2^252 + 27742317777372353535851937790883648493
const ED25519_ORDER_L = BigInt('7237005577332262213973186563042994240857116359379907606001950938285454250989');

export interface Ed25519MalleabilityConfig {
  strictCanonicalOnly?: boolean;
}

export function createEd25519MalleabilityRule(config: Ed25519MalleabilityConfig = {}): SentinelRule {
  const strict = config.strictCanonicalOnly ?? true;

  return {
    id: 'ed25519-malleability-scrubber',
    name: 'Ed25519 Signature Malleability Scrubber',
    category: 'custom' as ToolCategory,
    priority: 90,
    enabled: true,

    evaluate(context: ToolCallContext): RuleViolation | null {
      const tool = context.toolName.toLowerCase();
      if (!tool.includes('sign') && !tool.includes('tx') && !tool.includes('stellar') && !tool.includes('ed25519')) {
        return null;
      }

      const params = context.params || {};
      const sigRaw = params.signature || params.sig || params.ed25519Signature;

      if (!sigRaw || typeof sigRaw !== 'string') {
        return null;
      }

      const hex = sigRaw.replace(/^0x/i, '');
      if (hex.length !== 128) {
        return null; // Not a 64-byte Ed25519 signature
      }

      if (strict) {
        // Scalar component S is the second 32 bytes (little-endian)
        const sHex = hex.substring(64, 128);
        try {
          // Parse little-endian 32-byte integer
          let sVal = 0n;
          for (let i = 0; i < 32; i++) {
            const byteHex = sHex.substring(i * 2, (i + 1) * 2);
            const byteVal = BigInt(parseInt(byteHex, 16));
            sVal += byteVal << BigInt(i * 8);
          }

          if (sVal >= ED25519_ORDER_L) {
            return {
              ruleId: 'ed25519-malleability-scrubber',
              ruleName: 'Ed25519 Signature Malleability Scrubber',
              severity: 'critical',
              verdict: Verdict.BLOCK,
              reason: `Non-canonical Ed25519 signature detected: scalar component S exceeds curve order L. Transaction hash malleability intercepted.`,
              detectedPattern: `MALLEABLE_ED25519_SCALAR_S>=L`
            };
          }
        } catch {
          // If scalar parsing fails, block on safe side
          return {
            ruleId: 'ed25519-malleability-scrubber',
            ruleName: 'Ed25519 Signature Malleability Scrubber',
            severity: 'critical',
            verdict: Verdict.BLOCK,
            reason: 'Malformed Ed25519 signature scalar formatting.',
            detectedPattern: 'MALFORMED_SIGNATURE_HEX'
          };
        }
      }

      return null;
    }
  };
}
