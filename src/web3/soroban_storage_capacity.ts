/**
 * AgentSentinel - Soroban Instance Storage Byte Capacity Ceiling Guard
 * Enforces maximum byte storage capacity (64KB default) per contract instance
 * and single entry size limits to prevent storage bloat and out-of-memory errors.
 */

import { SentinelRule, ToolCallContext, RuleViolation, Verdict, ToolCategory } from '../types.js';

export interface SorobanStorageCapacityConfig {
  maxInstanceBytes?: number; // default: 65,536 bytes (64KB)
  maxEntryBytes?: number; // default: 16,384 bytes (16KB)
}

export function createSorobanStorageCapacityRule(config: SorobanStorageCapacityConfig = {}): SentinelRule {
  const maxInstanceBytes = config.maxInstanceBytes ?? 65536;
  const maxEntryBytes = config.maxEntryBytes ?? 16384;

  return {
    id: 'soroban-storage-capacity',
    name: 'Soroban Storage Capacity Ceiling Guard',
    category: 'custom' as ToolCategory,
    priority: 82,
    enabled: true,

    evaluate(context: ToolCallContext): RuleViolation | null {
      const tool = context.toolName.toLowerCase();
      if (!tool.includes('soroban') && !tool.includes('stellar') && !tool.includes('contract')) {
        return null;
      }

      const params = context.params || {};
      const payloadSize = Number(
        params.instanceByteSize ||
        params.payloadSize ||
        (params.data ? JSON.stringify(params.data).length : 0)
      );

      if (payloadSize > maxInstanceBytes) {
        return {
          ruleId: 'soroban-storage-capacity',
          ruleName: 'Soroban Storage Capacity Ceiling Guard',
          severity: 'high',
          verdict: Verdict.BLOCK,
          reason: `Contract instance storage update (${payloadSize} bytes) exceeds maximum 64KB capacity ceiling (${maxInstanceBytes} bytes).`,
          detectedPattern: `INSTANCE_STORAGE_OVERSIZED:${payloadSize}>${maxInstanceBytes}`,
        };
      }

      const entrySize = Number(params.entryByteSize || 0);
      if (entrySize > maxEntryBytes) {
        return {
          ruleId: 'soroban-storage-capacity',
          ruleName: 'Soroban Storage Capacity Ceiling Guard',
          severity: 'medium',
          verdict: Verdict.BLOCK,
          reason: `Single storage entry size (${entrySize} bytes) exceeds maximum 16KB limit (${maxEntryBytes} bytes).`,
          detectedPattern: `ENTRY_STORAGE_OVERSIZED:${entrySize}>${maxEntryBytes}`,
        };
      }

      return null;
    }
  };
}
