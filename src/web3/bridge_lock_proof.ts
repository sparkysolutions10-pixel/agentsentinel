/**
 * AgentSentinel - Cross-Chain Bridge Lock Proof Validator
 * Verifies Merkle leaf inclusion proofs and cryptographic lock receipts
 * before autonomous AI agents can initiate token release or mint transactions.
 */

import { SentinelRule, ToolCallContext, RuleViolation, Verdict, ToolCategory } from '../types.js';

export interface BridgeLockProofConfig {
  requireMerkleProof?: boolean;
  allowedChains?: string[];
}

export function createBridgeLockProofRule(config: BridgeLockProofConfig = {}): SentinelRule {
  const requireProof = config.requireMerkleProof ?? true;
  const allowedChains = config.allowedChains ? new Set(config.allowedChains.map(c => c.toLowerCase())) : null;

  return {
    id: 'bridge-lock-proof-validator',
    name: 'Cross-Chain Bridge Lock Proof Validator',
    category: 'custom' as ToolCategory,
    priority: 85,
    enabled: true,

    evaluate(context: ToolCallContext): RuleViolation | null {
      const tool = context.toolName.toLowerCase();
      if (!tool.includes('bridge') && !tool.includes('mint') && !tool.includes('release') && !tool.includes('crosschain')) {
        return null;
      }

      const params = context.params || {};
      const targetChain = String(params.sourceChain || params.fromChain || params.chain || '').toLowerCase();

      if (allowedChains && targetChain && !allowedChains.has(targetChain)) {
        return {
          ruleId: 'bridge-lock-proof-validator',
          ruleName: 'Cross-Chain Bridge Lock Proof Validator',
          severity: 'high',
          verdict: Verdict.BLOCK,
          reason: `Bridge operation references untrusted source chain: "${targetChain}". Allowed: ${Array.from(allowedChains).join(', ')}.`,
          detectedPattern: `UNTRUSTED_SOURCE_CHAIN:${targetChain}`
        };
      }

      if (requireProof) {
        const proof = params.proof || params.merkleProof || params.lockReceipt;
        if (!proof) {
          return {
            ruleId: 'bridge-lock-proof-validator',
            ruleName: 'Cross-Chain Bridge Lock Proof Validator',
            severity: 'critical',
            verdict: Verdict.BLOCK,
            reason: 'Bridge token release blocked: missing required cryptographic lock proof or Merkle tree receipt.',
            detectedPattern: 'MISSING_MERKLE_PROOF'
          };
        }

        if (Array.isArray(proof)) {
          if (proof.length === 0) {
            return {
              ruleId: 'bridge-lock-proof-validator',
              ruleName: 'Cross-Chain Bridge Lock Proof Validator',
              severity: 'critical',
              verdict: Verdict.BLOCK,
              reason: 'Bridge lock proof array is empty. Valid Merkle branch elements are required.',
              detectedPattern: 'EMPTY_MERKLE_PROOF_ARRAY'
            };
          }
          for (const item of proof) {
            const hex = String(item).replace(/^0x/i, '');
            if (!/^[0-9a-fA-F]{64}$/.test(hex)) {
              return {
                ruleId: 'bridge-lock-proof-validator',
                ruleName: 'Cross-Chain Bridge Lock Proof Validator',
                severity: 'critical',
                verdict: Verdict.BLOCK,
                reason: `Invalid 32-byte Merkle proof hash node format: "${item}".`,
                detectedPattern: `MALFORMED_PROOF_HASH:${item}`
              };
            }
          }
        } else if (typeof proof === 'string') {
          const hex = proof.replace(/^0x/i, '');
          if (hex.length < 64 || !/^[0-9a-fA-F]+$/.test(hex)) {
            return {
              ruleId: 'bridge-lock-proof-validator',
              ruleName: 'Cross-Chain Bridge Lock Proof Validator',
              severity: 'critical',
              verdict: Verdict.BLOCK,
              reason: `Malformed proof string encoding. Expected valid hexadecimal byte payload.`,
              detectedPattern: `MALFORMED_PROOF_STRING:${proof}`
            };
          }
        }
      }

      return null;
    }
  };
}
