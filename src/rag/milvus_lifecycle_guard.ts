import { SentinelRule, ToolCallContext, RuleViolation, Verdict } from '../types.js';

export function createMilvusLifecycleGuardRule(): SentinelRule {
  return {
    id: 'rag-milvus-lifecycle-guard',
    name: 'Block Destructive Milvus Drop Partition and Truncate Operations',
    category: 'custom',
    priority: 950,
    enabled: true,
    evaluate: (ctx: ToolCallContext): RuleViolation | null => {
      const tool = ctx.toolName.toLowerCase();
      const method = (ctx.params?.method || ctx.params?.action || '').toLowerCase();
      const isMilvus = tool.includes('milvus') || ctx.params?.client === 'milvus';
      if (!isMilvus) return null;

      const isDestructive =
        tool.includes('drop_partition') ||
        tool.includes('truncate') ||
        tool.includes('drop_collection') ||
        tool.includes('release_collection') ||
        tool.includes('releasecollection') ||
        method === 'drop_partition' ||
        method === 'truncate' ||
        method === 'drop_collection' ||
        method === 'release_collection' ||
        method === 'releasecollection';

      if (isDestructive) {
        return {
          ruleId: 'rag-milvus-lifecycle-guard',
          ruleName: 'Block Destructive Milvus Drop Partition and Truncate Operations',
          severity: 'critical',
          verdict: Verdict.BLOCK,
          reason: 'Destructive drop partition, collection drop, or truncate operation is prohibited.',
          detectedPattern: tool || method,
        };
      }
      return null;
    }
  };
}
