/**
 * AgentSentinel - Bridge Relayer Multisig Signature Guard
 * Enforces cryptographic quorum thresholds (m-of-n) on relayer signatures
 * before autonomous agents accept and execute cross-chain payload messages.
 */

import { SentinelRule, ToolCallContext, RuleViolation, Verdict, ToolCategory } from '../types.js';

export interface BridgeRelayerSignatureConfig {
  threshold?: number; // default: 3 valid signers
  authorizedRelayers?: string[];
}

export function createBridgeRelayerSignatureRule(config: BridgeRelayerSignatureConfig = {}): SentinelRule {
  const threshold = config.threshold ?? 3;
  const authorized = config.authorizedRelayers ? new Set(config.authorizedRelayers.map(r => r.toLowerCase())) : null;

  return {
    id: 'bridge-relayer-signature-guard',
    name: 'Bridge Relayer Multisig Signature Guard',
    category: 'custom' as ToolCategory,
    priority: 85,
    enabled: true,

    evaluate(context: ToolCallContext): RuleViolation | null {
      const tool = context.toolName.toLowerCase();
      if (!tool.includes('relay') && !tool.includes('bridge') && !tool.includes('oracle') && !tool.includes('attest')) {
        return null;
      }

      const params = context.params || {};
      const rawSignatures = params.signatures || params.relayerSignatures || params.attestations;

      if (!rawSignatures || !Array.isArray(rawSignatures)) {
        return {
          ruleId: 'bridge-relayer-signature-guard',
          ruleName: 'Bridge Relayer Multisig Signature Guard',
          severity: 'critical',
          verdict: Verdict.BLOCK,
          reason: 'Cross-chain relay message blocked: signatures payload must be an array of relayer attestations.',
          detectedPattern: 'MISSING_RELAYER_SIGNATURES'
        };
      }

      const uniqueSigners = new Set<string>();
      for (const sig of rawSignatures) {
        const signer = typeof sig === 'string' ? sig.toLowerCase() : String(sig.signer || sig.relayer || '').toLowerCase();
        if (signer) {
          if (authorized && !authorized.has(signer)) {
            return {
              ruleId: 'bridge-relayer-signature-guard',
              ruleName: 'Bridge Relayer Multisig Signature Guard',
              severity: 'critical',
              verdict: Verdict.BLOCK,
              reason: `Cross-chain relay contains signature from unauthorized relayer: "${signer}".`,
              detectedPattern: `UNAUTHORIZED_RELAYER_SIGNER:${signer}`
            };
          }
          uniqueSigners.add(signer);
        }
      }

      if (uniqueSigners.size < threshold) {
        return {
          ruleId: 'bridge-relayer-signature-guard',
          ruleName: 'Bridge Relayer Multisig Signature Guard',
          severity: 'critical',
          verdict: Verdict.BLOCK,
          reason: `Insufficient unique relayer signatures (${uniqueSigners.size}/${threshold}). Quorum not met.`,
          detectedPattern: `INSUFFICIENT_RELAYER_QUORUM:${uniqueSigners.size}<${threshold}`
        };
      }

      return null;
    }
  };
}
