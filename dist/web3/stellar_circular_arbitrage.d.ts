/**
 * AgentSentinel - Circular Path Payment Arbitrage Loop Detector
 * Identifies circular conversion chains (e.g. XLM -> USDC -> EURC -> XLM)
 * and halts execution if the net expected return is negative (loss-making arbitrage).
 */
import { SentinelRule } from '../types.js';
export interface StellarCircularArbitrageConfig {
    minNetProfitPercent?: number;
}
export declare function createStellarCircularArbitrageDetectorRule(config?: StellarCircularArbitrageConfig): SentinelRule;
//# sourceMappingURL=stellar_circular_arbitrage.d.ts.map