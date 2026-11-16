/**
 * AgentSentinel - PathPaymentStrictReceive Maximum Send Budget Clamp
 * Enforces strict sendMax ceilings on PathPaymentStrictReceive operations
 * to prevent autonomous agents from overpaying for a fixed destination asset.
 */
import { SentinelRule } from '../types.js';
export interface StellarPathStrictReceiveConfig {
    maxBudgetMultiplier?: number;
}
export declare function createStellarPathStrictReceiveClampRule(config?: StellarPathStrictReceiveConfig): SentinelRule;
//# sourceMappingURL=stellar_path_strict_receive.d.ts.map