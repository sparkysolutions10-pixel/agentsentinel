import { SentinelRule, ToolCallContext, RuleViolation, Verdict } from '../types.js';

const RAW_VECTOR_LITERAL_REGEX = /'<\s*\[[\d\.,\s-]+\]\s*>'/i;

export function createPgvectorParameterEnforcerRule(): SentinelRule {
  return {
    id: 'rag-pgvector-param-enforcer',
    name: 'Enforce Parameterized SQL Queries on pgvector Distance Operations',
    category: 'sql',
    priority: 955,
    enabled: true,
    evaluate: (ctx: ToolCallContext): RuleViolation | null => {
      const sql = ctx.params?.query ?? ctx.params?.sql;
      if (typeof sql === 'string') {
        if (sql.includes('<->') || sql.includes('<#>') || sql.includes('<=>')) {
          if (RAW_VECTOR_LITERAL_REGEX.test(sql) || (sql.includes("'[") && sql.includes("]'::vector"))) {
            return {
              ruleId: 'rag-pgvector-param-enforcer',
              ruleName: 'Enforce Parameterized SQL Queries on pgvector Distance Operations',
              severity: 'critical',
              verdict: Verdict.BLOCK,
              reason: 'Unparameterized raw vector literal detected in SQL query string. Use prepared statement query parameters ($1, $2) to prevent SQL injection.',
              detectedPattern: 'raw_vector_literal',
            };
          }
        }
      }
      return null;
    }
  };
}
