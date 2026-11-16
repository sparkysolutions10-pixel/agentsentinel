/**
 * AgentSentinel - Atomic Batch Invocation Rollback Monitor
 * Ensures batch contract executions enforce strict atomicity, verifying
 * that failures in any sub-operation immediately trigger full transaction revert
 * without leaving residual partial state mutations.
 */
import { SentinelRule } from '../types.js';
export interface SorobanRollbackConfig {
    disallowNonAtomicBatches?: boolean;
}
export declare function createSorobanRollbackMonitorRule(config?: SorobanRollbackConfig): SentinelRule;
//# sourceMappingURL=soroban_rollback_monitor.d.ts.map