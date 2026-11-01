import { SentinelRule, ToolCallContext, RuleViolation, Verdict } from '../types.js';

export function createPgvectorRlsInjectorRule(): SentinelRule {
  return {
    id: 'rag-pgvector-rls-injector',
    name: 'Enforce Row-Level Security Tenant Context on pgvector Queries',
    category: 'custom',
    priority: 910,
    enabled: true,
    evaluate: (ctx: ToolCallContext): RuleViolation | null => {
      const tool = ctx.toolName.toLowerCase();
      const isVectorSql = (tool.includes('pgvector') || tool.includes('postgres') || ctx.params?.dialect === 'postgres') &&
        (ctx.params?.query || ctx.params?.sql);
      if (!isVectorSql) return null;

      const tenantId = ctx.params?.tenantId || ctx.params?.tenant_id || ctx.params?.headers?.['x-tenant-id'];
      if (!tenantId || String(tenantId).trim() === '') {
        return {
          ruleId: 'rag-pgvector-rls-injector',
          ruleName: 'Enforce Row-Level Security Tenant Context on pgvector Queries',
          severity: 'critical',
          verdict: Verdict.BLOCK,
          reason: 'pgvector query rejected: Missing mandatory row-level tenant context identifier.',
          detectedPattern: 'unauthenticated-vector-query',
        };
      }

      return null;
    }
  };
}
