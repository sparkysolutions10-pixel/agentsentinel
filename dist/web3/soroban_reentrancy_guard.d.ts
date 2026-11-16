/**
 * AgentSentinel - Read-Only Reentrancy Guard for View Function Calls
 * Detects and blocks read-only reentrancy attacks where a view function
 * is queried during an intermediate, uncommitted contract state transition.
 */
import { SentinelRule } from '../types.js';
export interface SorobanReentrancyConfig {
    pendingMutations?: Set<string> | string[];
}
export declare function createSorobanReentrancyGuardRule(config?: SorobanReentrancyConfig): SentinelRule;
//# sourceMappingURL=soroban_reentrancy_guard.d.ts.map