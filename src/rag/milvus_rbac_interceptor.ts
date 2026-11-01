import { SentinelRule, ToolCallContext, RuleViolation, Verdict } from '../types.js';

export function createMilvusRbacInterceptorRule(): SentinelRule {
  return {
    id: 'rag-milvus-rbac-interceptor',
    name: 'Enforce Milvus User Role and Privilege Boundaries',
    category: 'custom',
    priority: 950,
    enabled: true,
    evaluate: (ctx: ToolCallContext): RuleViolation | null => {
      const isRbac = ctx.toolName.includes('create_user') || ctx.toolName.includes('grant_role') || ctx.toolName.includes('revoke_role');
      if (!isRbac) return null;
      const role = ctx.params?.role_name ?? ctx.params?.role;
      if (role && (role.toLowerCase() === 'admin' || role.toLowerCase() === 'root')) {
        return {
          ruleId: 'rag-milvus-rbac-interceptor',
          ruleName: 'Enforce Milvus User Role and Privilege Boundaries',
          severity: 'critical',
          verdict: Verdict.BLOCK,
          reason: `Unauthorized privilege escalation attempt: cannot assign superuser role "${role}".`,
          detectedPattern: role,
        };
      }
      return null;
    }
  };
}
