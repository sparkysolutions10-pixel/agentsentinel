import { SentinelRule, ToolCallContext, RuleViolation, Verdict } from '../types.js';

export function createZeroTrustVectorPolicyRule(): SentinelRule {
  return {
    id: 'rag-zero-trust-vector-policy',
    name: 'Zero-Trust Collection Access Policy Enforcer',
    category: 'custom',
    priority: 955,
    enabled: true,
    evaluate: (ctx: ToolCallContext): RuleViolation | null => {
      const collection = String(ctx.params?.collection || ctx.params?.table || '');
      const isRestricted = collection.includes('admin') || collection.includes('credentials') || collection.includes('sensitive');
      if (isRestricted) {
        const callerRole = ctx.params?.callerRole || ctx.params?.role;
        if (callerRole !== 'admin' && callerRole !== 'security-officer') {
          return {
            ruleId: 'rag-zero-trust-vector-policy',
            ruleName: 'Zero-Trust Collection Access Policy Enforcer',
            severity: 'critical',
            verdict: Verdict.BLOCK,
            reason: `Zero-trust policy denied access to restricted collection '${collection}' for role '${callerRole || 'anonymous'}'.`,
            detectedPattern: 'unauthorized-collection-access',
          };
        }
      }
      return null;
    }
  };
}
