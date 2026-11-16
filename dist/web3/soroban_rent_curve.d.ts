/**
 * AgentSentinel - Soroban Dynamic Rent Fee Curve Prediction Analyzer
 * Forecasts state rent fees using Soroban dynamic curve calculations
 * and blocks transactions when state rent fees surge exponentially above baseline.
 */
import { SentinelRule } from '../types.js';
export interface SorobanRentCurveConfig {
    baselineStroopsPerKbPerLedger?: bigint | number;
    maxAllowedRentStroops?: bigint | number;
    maxRentSurgeMultiplier?: number;
}
export declare function createSorobanRentCurveRule(config?: SorobanRentCurveConfig): SentinelRule;
//# sourceMappingURL=soroban_rent_curve.d.ts.map