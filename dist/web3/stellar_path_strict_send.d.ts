/**
 * AgentSentinel - PathPaymentStrictSend Maximum Destination Slippage Clamp
 * Enforces strict destMin thresholds on Stellar and Soroban path payments
 * to guarantee destination conversion never yields less than the required minimum.
 */
import { SentinelRule } from '../types.js';
export interface StellarPathStrictSendConfig {
    maxAllowedSlippagePercent?: number;
}
export declare function createStellarPathStrictSendClampRule(config?: StellarPathStrictSendConfig): SentinelRule;
//# sourceMappingURL=stellar_path_strict_send.d.ts.map