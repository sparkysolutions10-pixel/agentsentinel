import { SentinelRule, ToolCallContext, RuleViolation, Verdict } from '../types.js';

export function createVectorCanaryRule(): SentinelRule {
  return {
    id: 'rag-vector-canary-honeypot',
    name: 'Honeypot Canary Key Access Monitor',
    category: 'custom',
    priority: 920,
    enabled: true,
    evaluate: (ctx: ToolCallContext): RuleViolation | null => {
      const id = String(ctx.params?.id || ctx.params?.key || ctx.params?.vectorId || '');
      const filter = JSON.stringify(ctx.params || '');
      if (id.includes('__canary_rag_') || filter.includes('__canary_rag_')) {
        return {
          ruleId: 'rag-vector-canary-honeypot',
          ruleName: 'Honeypot Canary Key Access Monitor',
          severity: 'critical',
          verdict: Verdict.BLOCK,
          reason: 'Unauthorized access to vector security honeypot canary detected.',
          detectedPattern: '__canary_rag_key_access',
        };
      }
      return null;
    }
  };
}
