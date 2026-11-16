import { Verdict } from '../types.js';
export function createMilvusRbacInterceptorRule() {
    return {
        id: 'rag-milvus-rbac-interceptor',
        name: 'Enforce Milvus User Role and Privilege Boundaries',
        category: 'custom',
        priority: 950,
        enabled: true,
        evaluate: (ctx) => {
            const isRbac = ctx.toolName.includes('create_user') || ctx.toolName.includes('grant_role') || ctx.toolName.includes('revoke_role');
            if (!isRbac)
                return null;
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
//# sourceMappingURL=milvus_rbac_interceptor.js.map