import { SentinelRule, ToolCallContext, RuleViolation, Verdict } from '../types.js';

export function createPgvectorProbeLimiterRule(maxProbes: number = 50): SentinelRule {
  return {
    id: 'rag-pgvector-probe-limiter',
    name: 'Enforce Memory Ceiling on pgvector IVFFlat Probes',
    category: 'custom',
    priority: 880,
    enabled: true,
    evaluate: (ctx: ToolCallContext): RuleViolation | null => {
      const tool = ctx.toolName.toLowerCase();
      const isSql = tool.includes('sql') || tool.includes('postgres') || tool.includes('pgvector') || ctx.params?.dialect === 'postgres';
      if (!isSql) return null;

      const sql = String(ctx.params?.query || ctx.params?.sql || '').toLowerCase();
      const match = sql.match(/ivfflat\.probes\s*=\s*(\d+)/);
      if (match) {
        const count = parseInt(match[1], 10);
        if (count > maxProbes) {
          return {
            ruleId: 'rag-pgvector-probe-limiter',
            ruleName: 'Enforce Memory Ceiling on pgvector IVFFlat Probes',
            severity: 'high',
            verdict: Verdict.BLOCK,
            reason: `IVFFlat probes count ${count} exceeds allowed memory ceiling of ${maxProbes}.`,
            detectedPattern: match[0],
          };
        }
      }

      const explicitProbes = Number(ctx.params?.probes);
      if (explicitProbes && explicitProbes > maxProbes) {
        return {
          ruleId: 'rag-pgvector-probe-limiter',
          ruleName: 'Enforce Memory Ceiling on pgvector IVFFlat Probes',
          severity: 'high',
          verdict: Verdict.BLOCK,
          reason: `IVFFlat probes count ${explicitProbes} exceeds allowed memory ceiling of ${maxProbes}.`,
          detectedPattern: `probes=${explicitProbes}`,
        };
      }

      return null;
    }
  };
}
