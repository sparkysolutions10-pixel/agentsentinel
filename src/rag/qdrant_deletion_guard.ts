/**
 * AgentSentinel - Qdrant Point Deletion and Batch Clear Blocker Rule.
 * Intercepts batch point deletion and clear operations targeting Qdrant vector databases.
 */

import { SentinelRule, ToolCallContext, RuleViolation, Verdict } from '../types.js';

export interface QdrantPointDeletionGuardOptions {
  allowFilterDeletion?: boolean;
  maxBatchDeletePoints?: number;
}

const DELETION_TOOL_PATTERN = /(?:delete_points|clear_points|delete_by_filter|clear_collection_points)/i;

export function createQdrantPointDeletionGuardRule(
  options: QdrantPointDeletionGuardOptions = {}
): SentinelRule {
  const maxBatch = options.maxBatchDeletePoints ?? 100;

  return {
    id: 'rag-qdrant-point-deletion-guard',
    name: 'Block Indiscriminate and Batch Point Deletions in Qdrant',
    category: 'custom',
    priority: 935,
    enabled: true,
    evaluate: (ctx: ToolCallContext): RuleViolation | null => {
      const toolName = ctx.toolName || '';
      const method = (ctx.params?.method || ctx.params?.action || '').toLowerCase();

      const isDelete =
        DELETION_TOOL_PATTERN.test(toolName) ||
        method === 'delete_points' ||
        method === 'clear_points';

      if (!isDelete) return null;

      // Check indiscriminate filter deletion (wiping large subsets without point ID list)
      if (ctx.params?.filter && !options.allowFilterDeletion) {
        return {
          ruleId: 'rag-qdrant-point-deletion-guard',
          ruleName: 'Block Indiscriminate and Batch Point Deletions in Qdrant',
          severity: 'high',
          verdict: Verdict.BLOCK,
          reason: 'Mass point deletion via arbitrary filter selector is prohibited.',
          detectedPattern: 'delete_by_filter',
        };
      }

      // Check oversized point ID batch deletion
      const points = ctx.params?.points ?? ctx.params?.point_ids;
      if (Array.isArray(points) && points.length > maxBatch) {
        return {
          ruleId: 'rag-qdrant-point-deletion-guard',
          ruleName: 'Block Indiscriminate and Batch Point Deletions in Qdrant',
          severity: 'high',
          verdict: Verdict.BLOCK,
          reason: `Batch point deletion count (${points.length}) exceeds safety limit of ${maxBatch}.`,
          detectedPattern: `points.length=${points.length} > ${maxBatch}`,
        };
      }

      return null;
    },
  };
}

export const qdrantPointDeletionGuardRule: SentinelRule = createQdrantPointDeletionGuardRule();
