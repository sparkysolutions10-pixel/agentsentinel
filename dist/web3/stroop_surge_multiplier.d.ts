/**
 * AgentSentinel - Stroop Surge Multiplier Clamp
 * Clamps transaction base fees against rolling median network fees
 * to prevent runaway bidding wars during brief congestion spikes.
 */
import { SentinelRule } from '../types.js';
export interface StroopSurgeConfig {
    maxMultiplier?: number;
    defaultMedianStroops?: number;
}
export declare function createStroopSurgeMultiplierRule(config?: StroopSurgeConfig): SentinelRule;
//# sourceMappingURL=stroop_surge_multiplier.d.ts.map