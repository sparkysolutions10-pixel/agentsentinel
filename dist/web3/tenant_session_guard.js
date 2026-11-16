/**
 * AgentSentinel - Multi-Tenant Agent Session Isolation Guard
 * Enforces strict namespace fencing across multi-tenant autonomous agent fleets
 * to prevent cross-tenant data exfiltration and unauthorized resource access.
 */
import { Verdict } from '../types.js';
export function createTenantIsolationRule(config) {
    const currentTenant = config.currentTenantId.toLowerCase();
    return {
        id: 'tenant-session-isolation-guard',
        name: 'Multi-Tenant Agent Session Isolation Guard',
        category: 'custom',
        priority: 95,
        enabled: true,
        evaluate(context) {
            const params = context.params || {};
            const targetTenant = String(params.tenantId || params.namespace || params.organizationId || '').toLowerCase();
            if (!targetTenant) {
                return null;
            }
            if (targetTenant !== currentTenant) {
                return {
                    ruleId: 'tenant-session-isolation-guard',
                    ruleName: 'Multi-Tenant Agent Session Isolation Guard',
                    severity: 'critical',
                    verdict: Verdict.BLOCK,
                    reason: `Cross-tenant access violation: agent belonging to tenant "${currentTenant}" attempted to access resource belonging to tenant "${targetTenant}". Multi-tenant fence engaged.`,
                    detectedPattern: `CROSS_TENANT_VIOLATION:${currentTenant}!==${targetTenant}`
                };
            }
            return null;
        }
    };
}
//# sourceMappingURL=tenant_session_guard.js.map