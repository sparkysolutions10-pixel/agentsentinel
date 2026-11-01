import { SentinelRule, ToolCallContext, RuleViolation, Verdict } from '../types.js';

export function createPgvectorIndexGuardRule(): SentinelRule {
  return {
    id: 'rag-pgvector-index-guard',
    name: 'Require CONCURRENTLY on Production pgvector Index Creation',
    category: 'custom',
    priority: 870,
    enabled: true,
    evaluate: (ctx: ToolCallContext): RuleViolation | null => {
      const sql = String(ctx.params?.query || ctx.params?.sql || '').toLowerCase();
      const isVectorIndex = sql.includes('create index') && (sql.includes('using ivfflat') || sql.includes('using hnsw'));
      if (!isVectorIndex) return null;

      const isConcurrent = sql.includes('create index concurrently');
      if (!isConcurrent) {
        return {
          ruleId: 'rag-pgvector-index-guard',
          ruleName: 'Require CONCURRENTLY on Production pgvector Index Creation',
          severity: 'high',
          verdict: Verdict.BLOCK,
          reason: 'pgvector index creation without CONCURRENTLY causes full table locks.',
          detectedPattern: 'non-concurrent-vector-index-creation',
        };
      }

      return null;
    }
  };
}
