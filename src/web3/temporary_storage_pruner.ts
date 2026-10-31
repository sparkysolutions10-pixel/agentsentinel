/**
 * AgentSentinel - Soroban Temporary Storage Pruner Simulator
 * Prevents developers and autonomous agents from storing persistent state (balances, allowances)
 * in Soroban Temporary storage entries that will be automatically destroyed upon TTL expiration.
 */

import { SentinelRule, ToolCallContext, RuleViolation, Verdict, ToolCategory } from '../types.js';

const PERSISTENT_KEY_KEYWORDS = ['balance', 'allowance', 'owner', 'admin', 'vault', 'reserve', 'shares'];

export function createTemporaryStoragePrunerRule(): SentinelRule {
  return {
    id: 'temporary-storage-pruner-simulator',
    name: 'Soroban Temporary Storage Pruner Simulator',
    category: 'custom' as ToolCategory,
    priority: 85,
    enabled: true,

    evaluate(context: ToolCallContext): RuleViolation | null {
      const tool = context.toolName.toLowerCase();
      if (!tool.includes('storage') && !tool.includes('soroban') && !tool.includes('set')) {
        return null;
      }

      const params = context.params || {};
      const storageType = String(params.storageType || params.type || '').toLowerCase();

      if (storageType === 'temporary') {
        const keyName = String(params.key || params.keyName || params.storageKey || '').toLowerCase();
        for (const kw of PERSISTENT_KEY_KEYWORDS) {
          if (keyName.includes(kw)) {
            return {
              ruleId: 'temporary-storage-pruner-simulator',
              ruleName: 'Soroban Temporary Storage Pruner Simulator',
              severity: 'critical',
              verdict: Verdict.BLOCK,
              reason: `Dangerous storage type: writing critical persistent key "${keyName}" to Temporary storage. Key will be pruned on TTL expiry causing catastrophic asset loss. Use Persistent or Instance storage.`,
              detectedPattern: `CRITICAL_KEY_IN_TEMPORARY_STORAGE:${kw}`
            };
          }
        }
      }

      return null;
    }
  };
}
