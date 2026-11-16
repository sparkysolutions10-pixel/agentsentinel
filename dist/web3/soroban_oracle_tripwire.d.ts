/**
 * AgentSentinel - Oracle Price Deviation and Stale Feed Tripwire
 * Validates on-chain oracle timestamps against freshness thresholds (< 300s)
 * and trips when price quotes deviate > 3% from secondary benchmark feeds.
 */
import { SentinelRule } from '../types.js';
export interface SorobanOracleConfig {
    maxStalenessSeconds?: number;
    maxDeviationPercent?: number;
}
export declare function createSorobanOracleTripwireRule(config?: SorobanOracleConfig): SentinelRule;
//# sourceMappingURL=soroban_oracle_tripwire.d.ts.map