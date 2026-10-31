/**
 * AgentSentinel - Multi-Tenant Agent Session Isolation Guard
 * Enforces strict namespace fencing across multi-tenant autonomous agent fleets
 * to prevent cross-tenant data exfiltration and unauthorized resource access.
 */

import { SentinelRule, ToolCallContext, RuleViolation, Verdict, ToolCategory } from '../types.js';

export interface TenantIsolationConfig {
  currentTenantId: string;
}

export function createTenantIsolationRule(config: TenantIsolationConfig): SentinelRule {
  const currentTenant = config.currentTenantId.toLowerCase();

  return {
    id: 'tenant-session-isolation-guard',
    name: 'Multi-Tenant Agent Session Isolation Guard',
    category: 'custom' as ToolCategory,
    priority: 95,
    enabled: true,

    evaluate(context: ToolCallContext): RuleViolation | null {
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
