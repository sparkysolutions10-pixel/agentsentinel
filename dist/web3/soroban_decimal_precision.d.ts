/**
 * AgentSentinel - i128 Decimal Precision Overflow and Rounding Checker
 * Verifies mathematical calculations and token values inside Soroban invocations
 * never truncate or overflow i128 bounds (-2^127 to 2^127 - 1) or lose precision beyond token decimals.
 */
import { SentinelRule } from '../types.js';
export interface SorobanDecimalPrecisionConfig {
    maxDecimals?: number;
}
export declare function createSorobanDecimalPrecisionCheckerRule(config?: SorobanDecimalPrecisionConfig): SentinelRule;
//# sourceMappingURL=soroban_decimal_precision.d.ts.map