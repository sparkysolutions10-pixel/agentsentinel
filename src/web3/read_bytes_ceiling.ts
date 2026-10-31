/**
 * AgentSentinel - Soroban Read Bytes Memory Ceiling Guard
 * Restricts maximum contract storage bytes loaded into memory during execution
 * to prevent excessive read fees and out-of-memory transaction aborts.
 */

import { SentinelRule, ToolCallContext, RuleViolation, Verdict, ToolCategory } from '../types.js';

export interface ReadBytesConfig {
  maxReadBytes?: number; // default: 65,536 bytes (64 KB)
}

export function createReadBytesCeilingRule(config: ReadBytesConfig = {}): SentinelRule {
  const maxBytes = config.maxReadBytes ?? 65536;

  return {
    id: 'read-bytes-memory-ceiling',
    name: 'Soroban Read Bytes Memory Ceiling',
    category: 'custom' as ToolCategory,
    priority: 80,
    enabled: true,

    evaluate(context: ToolCallContext): RuleViolation | null {
      const tool = context.toolName.toLowerCase();
      if (!tool.includes('soroban') && !tool.includes('simulate') && !tool.includes('invoke')) {
        return null;
      }

      const params = context.params || {};
      const readBytes = Number(params.readBytes ?? params.storageReadBytes ?? 0);

      if (readBytes > maxBytes) {
        return {
          ruleId: 'read-bytes-memory-ceiling',
          ruleName: 'Soroban Read Bytes Memory Ceiling',
          severity: 'high',
          verdict: Verdict.BLOCK,
          reason: `Storage read footprint (${readBytes.toLocaleString()} bytes) exceeds memory ceiling (${maxBytes.toLocaleString()} bytes). Storage footprint reduction required.`,
          detectedPattern: `READ_BYTES_CEILING_EXCEEDED:${readBytes}>${maxBytes}`
        };
      }

      return null;
    }
  };
}
