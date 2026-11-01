import { SentinelRule, ToolCallContext, RuleViolation, Verdict } from '../types.js';

export function inspectMilvusIndexParams(params: Record<string, any>): { isValid: boolean; reason?: string } {
  if (!params) return { isValid: true };
  const extra = params.extra_params ?? params.params ?? params;
  const m = extra.M ?? extra.m;
  if (typeof m === 'number' && m > 64) {
    return { isValid: false, reason: `HNSW index parameter M (${m}) exceeds safe memory limit of 64. Risk of cluster node OOM.` };
  }
  const efConstruction = extra.efConstruction ?? extra.ef_construction;
  if (typeof efConstruction === 'number' && efConstruction > 512) {
    return { isValid: false, reason: `HNSW parameter efConstruction (${efConstruction}) exceeds memory ceiling of 512.` };
  }
  return { isValid: true };
}

export function createMilvusIndexMemoryControllerRule(): SentinelRule {
  return {
    id: 'rag-milvus-index-memory-controller',
    name: 'Validate Milvus Index Parameters Against Cluster Memory Ceilings',
    category: 'custom',
    priority: 930,
    enabled: true,
    evaluate: (ctx: ToolCallContext): RuleViolation | null => {
      const isIndex = ctx.toolName.includes('create_index') || ctx.toolName.includes('build_index');
      if (!isIndex) return null;
      const inspection = inspectMilvusIndexParams(ctx.params);
      if (!inspection.isValid) {
        return {
          ruleId: 'rag-milvus-index-memory-controller',
          ruleName: 'Validate Milvus Index Parameters Against Cluster Memory Ceilings',
          severity: 'high',
          verdict: Verdict.BLOCK,
          reason: inspection.reason || 'Unsafe index parameter detected.',
        };
      }
      return null;
    }
  };
}
