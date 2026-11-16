/**
 * AgentSentinel - Stellar Fee Bump Transaction Guard
 * Clamps maximum base fee surges on FeeBumpTransaction operations
 * to prevent runaway bidding wars and gas drain during network congestion.
 */
import { SentinelRule } from '../types.js';
export interface FeeBumpingConfig {
    maxBaseFeeStroops?: number;
    maxTotalFeeStroops?: number;
}
export declare function createTransactionFeeBumpingRule(config?: FeeBumpingConfig): SentinelRule;
//# sourceMappingURL=transaction_fee_bumping_guard.d.ts.map