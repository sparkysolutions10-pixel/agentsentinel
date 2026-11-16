/**
 * AgentSentinel - Multi-Tenant Agent Session Isolation Guard
 * Enforces strict namespace fencing across multi-tenant autonomous agent fleets
 * to prevent cross-tenant data exfiltration and unauthorized resource access.
 */
import { SentinelRule } from '../types.js';
export interface TenantIsolationConfig {
    currentTenantId: string;
}
export declare function createTenantIsolationRule(config: TenantIsolationConfig): SentinelRule;
//# sourceMappingURL=tenant_session_guard.d.ts.map