/**
 * AgentSentinel - Qdrant Collection Snapshot Exfiltration Guard Rule.
 * Intercepts snapshot creation and download requests targeting Qdrant vector collections.
 */

import { SentinelRule, ToolCallContext, RuleViolation, Verdict } from '../types.js';

export interface QdrantSnapshotGuardOptions {
  allowSnapshots?: boolean;
  action?: 'BLOCK' | 'CONFIRM';
}

const SNAPSHOT_TOOL_PATTERN = /(?:snapshot|dump_collection|export_collection|download_snapshot|create_snapshot)/i;

export function createQdrantSnapshotGuardRule(
  options: QdrantSnapshotGuardOptions = {}
): SentinelRule {
  const verdict = options.action === 'CONFIRM' ? Verdict.CONFIRM : Verdict.BLOCK;

  return {
    id: 'rag-qdrant-snapshot-guard',
    name: 'Block Unauthorized Qdrant Collection Snapshot Creation and Exfiltration',
    category: 'custom',
    priority: 940,
    enabled: true,
    evaluate: (ctx: ToolCallContext): RuleViolation | null => {
      const toolName = ctx.toolName || '';
      const method = (ctx.params?.method || ctx.params?.action || '').toLowerCase();

      const isSnapshotAction =
        SNAPSHOT_TOOL_PATTERN.test(toolName) ||
        method === 'create_snapshot' ||
        method === 'download_snapshot' ||
        method === 'createsnapshot' ||
        method === 'downloadsnapshot';

      if (isSnapshotAction && !options.allowSnapshots) {
        return {
          ruleId: 'rag-qdrant-snapshot-guard',
          ruleName: 'Block Unauthorized Qdrant Collection Snapshot Creation and Exfiltration',
          severity: 'critical',
          verdict,
          reason: 'Unauthorized collection snapshot creation or exfiltration attempt detected.',
          detectedPattern: toolName || method,
        };
      }

      return null;
    },
  };
}

export const qdrantSnapshotGuardRule: SentinelRule = createQdrantSnapshotGuardRule();
