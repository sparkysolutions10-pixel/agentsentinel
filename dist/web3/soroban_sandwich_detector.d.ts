/**
 * AgentSentinel - Mempool Sandwich Attack and Front-Running Detector
 * Detects sudden gas/fee spikes and hostile liquidity shifts preceding
 * transaction broadcast to shield agents from predatory sandwiching.
 */
import { SentinelRule } from '../types.js';
export interface SorobanSandwichConfig {
    feeSpikeRatioThreshold?: number;
}
export declare function createSorobanSandwichDetectorRule(config?: SorobanSandwichConfig): SentinelRule;
//# sourceMappingURL=soroban_sandwich_detector.d.ts.map