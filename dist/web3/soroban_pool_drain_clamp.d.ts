/**
 * AgentSentinel - Liquidity Pool Reserves Drain Limit Clamp
 * Clamps maximum liquidity extraction per transaction (< 10% default)
 * to prevent sudden drain attacks, bank runs, and protocol insolvency.
 */
import { SentinelRule } from '../types.js';
export interface SorobanPoolDrainConfig {
    maxDrainPercent?: number;
}
export declare function createSorobanPoolDrainClampRule(config?: SorobanPoolDrainConfig): SentinelRule;
//# sourceMappingURL=soroban_pool_drain_clamp.d.ts.map