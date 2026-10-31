/**
 * AgentSentinel - Source Account Sequence Number Anti-Desync Checker
 * Tracks and validates sequence numbers to prevent transaction failures
 * caused by sequence gaps, stale sequences, or desynchronized multi-agent submissions.
 */

import { SentinelRule, ToolCallContext, RuleViolation, Verdict, ToolCategory } from '../types.js';

export interface StellarSequenceCheckerConfig {
  maxAllowedSequenceGap?: number; // default: 10
}

export function createStellarSequenceCheckerRule(config: StellarSequenceCheckerConfig = {}): SentinelRule {
  const maxGap = config.maxAllowedSequenceGap ?? 10;
  const lastKnownSequences = new Map<string, bigint>();

  return {
    id: 'stellar-sequence-checker',
    name: 'Stellar Sequence Anti-Desync Checker',
    category: 'custom' as ToolCategory,
    priority: 77,
    enabled: true,

    evaluate(context: ToolCallContext): RuleViolation | null {
      const tool = context.toolName.toLowerCase();
      if (!tool.includes('soroban') && !tool.includes('stellar') && !tool.includes('transaction')) {
        return null;
      }

      const params = context.params || {};
      const sourceAccount = String(params.sourceAccount || params.source || '').trim();
      const rawSeq = params.sequenceNumber || params.seqNum || params.sequence;

      if (sourceAccount && rawSeq !== undefined && rawSeq !== null) {
        try {
          const currentSeq = BigInt(rawSeq);
          const lastSeq = lastKnownSequences.get(sourceAccount);

          if (lastSeq !== undefined) {
            // Check for stale sequence (current <= lastSeq)
            if (currentSeq <= lastSeq) {
              return {
                ruleId: 'stellar-sequence-checker',
                ruleName: 'Stellar Sequence Anti-Desync Checker',
                severity: 'high',
                verdict: Verdict.BLOCK,
                reason: `Stale or duplicate sequence number: ${currentSeq} is <= last known sequence ${lastSeq}. Transaction will fail txBAD_SEQ.`,
                detectedPattern: `STALE_SEQUENCE:${currentSeq}<=${lastSeq}`,
              };
            }

            // Check for sequence gap (> maxGap)
            const gap = currentSeq - lastSeq;
            if (gap > BigInt(maxGap)) {
              return {
                ruleId: 'stellar-sequence-checker',
                ruleName: 'Stellar Sequence Anti-Desync Checker',
                severity: 'medium',
                verdict: Verdict.BLOCK,
                reason: `Sequence number gap too large: attempted sequence ${currentSeq} exceeds last known ${lastSeq} by ${gap} (max allowed gap is ${maxGap}).`,
                detectedPattern: `SEQUENCE_GAP_OVERFLOW:${gap}>${maxGap}`,
              };
            }
          }

          lastKnownSequences.set(sourceAccount, currentSeq);
        } catch {
          // ignore non-integer parse failures
        }
      }

      return null;
    }
  };
}
