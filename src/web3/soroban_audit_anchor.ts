/**
 * AgentSentinel - Cryptographic Audit Log Proof Anchor to Stellar Ledger
 * Anchors verifiable SHA-256 state roots and audit decisions onto the Stellar ledger (via transaction memo or contract state)
 * to provide tamper-evident cryptographic proof of AI agent compliance.
 */

import { SentinelRule, ToolCallContext, RuleViolation, Verdict, ToolCategory } from '../types.js';

export interface SorobanAuditAnchorConfig {
  requireCryptographicProof?: boolean; // default: true
}

export function createSorobanAuditProofAnchorRule(config: SorobanAuditAnchorConfig = {}): SentinelRule {
  const requireProof = config.requireCryptographicProof ?? true;

  return {
    id: 'soroban-audit-anchor',
    name: 'Soroban Cryptographic Audit Log Anchor',
    category: 'custom' as ToolCategory,
    priority: 88,
    enabled: true,

    evaluate(context: ToolCallContext): RuleViolation | null {
      const tool = context.toolName.toLowerCase();
      if (!tool.includes('audit') && !tool.includes('anchor') && !tool.includes('log')) {
        return null;
      }

      const params = context.params || {};
      const auditHash = String(params.auditHash || params.stateRootHash || '').trim();
      const ledgerMemo = String(params.memo || params.memoHash || '').trim();

      if (requireProof && (!auditHash || auditHash.length < 32)) {
        return {
          ruleId: 'soroban-audit-anchor',
          ruleName: 'Soroban Cryptographic Audit Log Anchor',
          severity: 'high',
          verdict: Verdict.BLOCK,
          reason: 'Audit log anchoring missing required 256-bit cryptographic state hash.',
          detectedPattern: 'MISSING_AUDIT_HASH',
        };
      }

      if (ledgerMemo && auditHash && !ledgerMemo.toLowerCase().includes(auditHash.substring(0, 16).toLowerCase())) {
        return {
          ruleId: 'soroban-audit-anchor',
          ruleName: 'Soroban Cryptographic Audit Log Anchor',
          severity: 'critical',
          verdict: Verdict.BLOCK,
          reason: 'Cryptographic mismatch between audit log root hash and Stellar ledger anchor memo.',
          detectedPattern: `AUDIT_PROOF_MISMATCH:${auditHash}!=${ledgerMemo}`,
        };
      }

      return null;
    }
  };
}
