/**
 * AgentSentinel - Soroban Write Bytes Memory Ceiling Guard
 * Restricts maximum contract storage bytes written in a single transaction
 * to protect against state bloat and runaway storage rent charges.
 */

import { SentinelRule, ToolCallContext, RuleViolation, Verdict, ToolCategory } from '../types.js';

export interface WriteBytesConfig {
  maxWriteBytes?: number; // default: 32,768 bytes (32 KB)
}

export function createWriteBytesCeilingRule(config: WriteBytesConfig = {}): SentinelRule {
  const maxBytes = config.maxWriteBytes ?? 32768;

  return {
    id: 'write-bytes-memory-ceiling',
    name: 'Soroban Write Bytes Memory Ceiling',
    category: 'custom' as ToolCategory,
    priority: 80,
    enabled: true,

    evaluate(context: ToolCallContext): RuleViolation | null {
      const tool = context.toolName.toLowerCase();
      if (!tool.includes('soroban') && !tool.includes('invoke') && !tool.includes('write')) {
        return null;
      }

      const params = context.params || {};
      const writeBytes = Number(params.writeBytes ?? params.storageWriteBytes ?? 0);

      if (writeBytes > maxBytes) {
        return {
          ruleId: 'write-bytes-memory-ceiling',
          ruleName: 'Soroban Write Bytes Memory Ceiling',
          severity: 'high',
          verdict: Verdict.BLOCK,
          reason: `Storage write footprint (${writeBytes.toLocaleString()} bytes) exceeds write ceiling (${maxBytes.toLocaleString()} bytes). State write rejected.`,
          detectedPattern: `WRITE_BYTES_CEILING_EXCEEDED:${writeBytes}>${maxBytes}`
        };
      }

      return null;
    }
  };
}
