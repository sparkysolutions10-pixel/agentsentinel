/**
 * AgentSentinel - Maximum Path Hops Count Limiter
 * Restricts Stellar payment conversion paths to at most 5 hops (default standard)
 * to avoid excessive transaction fee accumulation and combinatorial latency.
 */
import { SentinelRule } from '../types.js';
export interface StellarPathHopsConfig {
    maxHops?: number;
}
export declare function createStellarPathHopsLimiterRule(config?: StellarPathHopsConfig): SentinelRule;
//# sourceMappingURL=stellar_path_hops_limiter.d.ts.map