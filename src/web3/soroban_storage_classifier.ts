/**
 * AgentSentinel - Soroban Temporary vs Persistent Storage Classification Filter
 * Enforces hygiene between Temporary and Persistent storage, preventing ephemeral
 * session facts, nonces, and caches from bloating persistent ledger state.
 */

import { SentinelRule, ToolCallContext, RuleViolation, Verdict, ToolCategory } from '../types.js';

export interface SorobanStorageClassifierConfig {
  disallowTransientInPersistent?: boolean;
}

const TRANSIENT_PATTERNS = [
  /session/i,
  /nonce/i,
  /transient/i,
  /temp_/i,
  /ephemeral/i,
  /cache/i,
  /auth_token/i,
  /challenge/i,
  /otp/i,
];

export function createSorobanStorageClassifierRule(config: SorobanStorageClassifierConfig = {}): SentinelRule {
  const disallowTransient = config.disallowTransientInPersistent ?? true;

  return {
    id: 'soroban-storage-classifier',
    name: 'Soroban Storage Classification Filter',
    category: 'custom' as ToolCategory,
    priority: 81,
    enabled: true,

    evaluate(context: ToolCallContext): RuleViolation | null {
      const tool = context.toolName.toLowerCase();
      if (!tool.includes('soroban') && !tool.includes('stellar') && !tool.includes('contract')) {
        return null;
      }

      const params = context.params || {};
      const storageType = String(params.storageType || params.durability || '').trim().toLowerCase();
      const storageKey = String(params.key || params.storageKey || '').trim();

      if (disallowTransient && storageType === 'persistent') {
        for (const pattern of TRANSIENT_PATTERNS) {
          if (pattern.test(storageKey)) {
            return {
              ruleId: 'soroban-storage-classifier',
              ruleName: 'Soroban Storage Classification Filter',
              severity: 'medium',
              verdict: Verdict.BLOCK,
              reason: `Key "${storageKey}" represents transient session data but is targeted for Persistent storage. Use Temporary storage to prevent permanent ledger rent bloat.`,
              detectedPattern: `TRANSIENT_IN_PERSISTENT:${storageKey}`,
            };
          }
        }
      }

      return null;
    }
  };
}
