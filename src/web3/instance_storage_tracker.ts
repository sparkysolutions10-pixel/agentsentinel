/**
 * AgentSentinel - Soroban Instance Storage Lifecycle Tracker
 * Tracks contract instance storage expiration ledgers (liveUntilLedger)
 * to warn and intercept interactions with contracts facing imminent archival.
 */

import { SentinelRule, ToolCallContext, RuleViolation, Verdict, ToolCategory } from '../types.js';

export interface StorageLifecycleConfig {
  minLedgersBeforeExpiry?: number; // default: 1,000 ledgers (~1.5 hours)
}

export function createInstanceStorageTrackerRule(config: StorageLifecycleConfig = {}): SentinelRule {
  const minBuffer = config.minLedgersBeforeExpiry ?? 1000;

  return {
    id: 'instance-storage-lifecycle-tracker',
    name: 'Soroban Instance Storage Lifecycle Tracker',
    category: 'custom' as ToolCategory,
    priority: 85,
    enabled: true,

    evaluate(context: ToolCallContext): RuleViolation | null {
      const tool = context.toolName.toLowerCase();
      if (!tool.includes('soroban') && !tool.includes('contract') && !tool.includes('invoke')) {
        return null;
      }

      const params = context.params || {};
      const liveUntil = Number(params.liveUntilLedger ?? params.expirationLedger ?? 0);
      const currentLedger = Number(params.currentLedger ?? 0);

      if (liveUntil > 0 && currentLedger > 0) {
        const remaining = liveUntil - currentLedger;
        if (remaining <= 0) {
          return {
            ruleId: 'instance-storage-lifecycle-tracker',
            ruleName: 'Soroban Instance Storage Lifecycle Tracker',
            severity: 'critical',
            verdict: Verdict.BLOCK,
            reason: `Contract instance storage has expired (current: ${currentLedger}, expired at: ${liveUntil}). Contract is archived.`,
            detectedPattern: `CONTRACT_ARCHIVED:${remaining}<=0`
          };
        }

        if (remaining < minBuffer) {
          return {
            ruleId: 'instance-storage-lifecycle-tracker',
            ruleName: 'Soroban Instance Storage Lifecycle Tracker',
            severity: 'high',
            verdict: Verdict.BLOCK,
            reason: `Contract instance storage is near archival (${remaining} ledgers remaining, required buffer: ${minBuffer}). Bump footprint required.`,
            detectedPattern: `EXPIRATION_IMMINENT:${remaining}<${minBuffer}`
          };
        }
      }

      return null;
    }
  };
}
