/**
 * AgentSentinel - Stellar Sequence Number Gap & Stale Nonce Detector
 * Enforces strictly monotonic sequence progression (N+1) to prevent
 * transaction starvation, nonce collisions, and out-of-order rejections.
 */

import { SentinelRule, ToolCallContext, RuleViolation, Verdict, ToolCategory } from '../types.js';

export interface SequenceNumberGapConfig {
  maxAllowedGap?: number; // default: 1 (strictly N+1)
}

export function createSequenceNumberGapRule(config: SequenceNumberGapConfig = {}): SentinelRule {
  const maxGap = config.maxAllowedGap ?? 1;

  return {
    id: 'sequence-number-gap-detector',
    name: 'Stellar Sequence Number Gap Detector',
    category: 'custom' as ToolCategory,
    priority: 85,
    enabled: true,

    evaluate(context: ToolCallContext): RuleViolation | null {
      const tool = context.toolName.toLowerCase();
      if (!tool.includes('stellar') && !tool.includes('soroban') && !tool.includes('tx') && !tool.includes('submit')) {
        return null;
      }

      const params = context.params || {};
      const txSeqRaw = params.sequenceNumber ?? params.seqNum ?? params.sequence;
      const currentSeqRaw = params.currentAccountSequence ?? params.accountSequence ?? params.expectedSequence;

      if (txSeqRaw === undefined || currentSeqRaw === undefined) {
        return null;
      }

      const txSeq = BigInt(txSeqRaw);
      const currentSeq = BigInt(currentSeqRaw);

      if (txSeq <= currentSeq) {
        return {
          ruleId: 'sequence-number-gap-detector',
          ruleName: 'Stellar Sequence Number Gap Detector',
          severity: 'high',
          verdict: Verdict.BLOCK,
          reason: `Stale or duplicate sequence number: submitted sequence (${txSeq}) <= current account sequence (${currentSeq}). Transaction will fail with txBAD_SEQ.`,
          detectedPattern: `STALE_SEQUENCE_NONCE:${txSeq}<=${currentSeq}`
        };
      }

      const delta = txSeq - currentSeq;
      if (delta > BigInt(maxGap)) {
        return {
          ruleId: 'sequence-number-gap-detector',
          ruleName: 'Stellar Sequence Number Gap Detector',
          severity: 'high',
          verdict: Verdict.BLOCK,
          reason: `Sequence number gap detected: submitted sequence (${txSeq}) exceeds current sequence (${currentSeq}) by delta ${delta} (max allowed gap: ${maxGap}). Unconfirmed preceding transactions may starve.`,
          detectedPattern: `SEQUENCE_GAP_DETECTED:${delta}>${maxGap}`
        };
      }

      return null;
    }
  };
}
