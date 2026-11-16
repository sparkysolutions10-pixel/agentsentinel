/**
 * AgentSentinel - Token Allowance Expiration & Auto-Revoke Guard
 * Prevents unlimited (u128::MAX) token approvals on Soroban SEP-41 contracts,
 * clamps approvals to exact order amounts, and enforces finite expiration ledgers.
 */
import { SentinelRule } from '../types.js';
export interface SorobanAllowanceConfig {
    maxAllowedApproval?: number;
    maxExpirationLedgers?: number;
}
export declare function createSorobanAllowanceRevokeGuardRule(config?: SorobanAllowanceConfig): SentinelRule;
//# sourceMappingURL=soroban_allowance_guard.d.ts.map