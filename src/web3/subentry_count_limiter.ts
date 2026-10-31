/**
 * AgentSentinel - Stellar Subentry Count Limiter
 * Clamps maximum account subentries (trustlines, offers, signers, data entries)
 * to prevent account reserve lockouts and insufficient balance conditions.
 */

import { SentinelRule, ToolCallContext, RuleViolation, Verdict, ToolCategory } from '../types.js';

export interface SubentryCountConfig {
  maxSubentries?: number; // default: 950 (Stellar hard ceiling is 1000)
}

export function createSubentryCountRule(config: SubentryCountConfig = {}): SentinelRule {
  const maxLimit = config.maxSubentries ?? 950;

  return {
    id: 'subentry-count-limiter',
    name: 'Stellar Subentry Count Limiter',
    category: 'custom' as ToolCategory,
    priority: 80,
    enabled: true,

    evaluate(context: ToolCallContext): RuleViolation | null {
      const tool = context.toolName.toLowerCase();
      if (!tool.includes('trustline') && !tool.includes('offer') && !tool.includes('signer') && !tool.includes('subentry')) {
        return null;
      }

      const params = context.params || {};
      const currentSubentries = Number(params.currentSubentries ?? params.subentryCount ?? params.subentries ?? 0);
      const newEntries = Number(params.newSubentries ?? params.entriesCount ?? 1);

      if (currentSubentries + newEntries > maxLimit) {
        return {
          ruleId: 'subentry-count-limiter',
          ruleName: 'Stellar Subentry Count Limiter',
          severity: 'high',
          verdict: Verdict.BLOCK,
          reason: `Account subentry threshold reached: resulting count (${currentSubentries + newEntries}) exceeds safety ceiling (${maxLimit}). Further trustline/offer creation halted to protect reserve balance.`,
          detectedPattern: `SUBENTRY_CEILING_EXCEEDED:${currentSubentries + newEntries}>${maxLimit}`
        };
      }

      return null;
    }
  };
}
