/**
 * AgentSentinel - Soroban State Rent & Fee Surge Defense Rule
 * Protects autonomous AI agents and dApps from Stellar/Soroban storage rent spikes,
 * predatory fee surges, and uint32 overflow transaction simulation crashes.
 */
import { SentinelRule, ToolCallContext, RuleViolation } from '../types.js';
export declare const UINT32_MAX = 4294967295n;
export declare const STROOPS_PER_XLM = 10000000n;
export declare const DEFAULT_MAX_FEE_XLM = 10;
export declare const DEFAULT_MAX_FEE_STROOPS: bigint;
export declare const DEFAULT_MAX_RENT_PER_KB_STROOPS = 50000n;
export declare const DEFAULT_MAX_GROWTH_FACTOR = 1000;
export interface SorobanFeeGuardConfig {
    maxFeeXlm?: number;
    maxAllowedFeeXlm?: number;
    maxFeeStroops?: bigint | number | string;
    maxAllowedFeeStroops?: bigint | number | string;
    maxRentPerKbStroops?: bigint | number | string;
    maxGrowthFactor?: number;
    enableUint32OverflowProtection?: boolean;
}
/**
 * Safely parses any arbitrary value into BigInt stroops.
 */
export declare function parseStroops(val: unknown): bigint;
/**
 * Formats a BigInt stroop amount into human-readable XLM string.
 */
export declare function formatStroopsToXlm(stroops: bigint): string;
/**
 * Checks if a tool call context belongs to Soroban / Stellar execution.
 */
export declare function isSorobanOrStellarContext(ctx: ToolCallContext): boolean;
/**
 * Creates the Soroban State Rent & Fee Surge Guard SentinelRule.
 */
export declare function createSorobanFeeSurgeGuardRule(config?: SorobanFeeGuardConfig): SentinelRule;
/**
 * Convenience helper to simulate Soroban transactions and assert safety against Fee Surges.
 */
export declare function simulateSorobanTransactionWithGuard(simulationFn: () => Promise<{
    minResourceFee?: string | number | bigint;
    fee?: string | number | bigint;
    resourceFee?: string | number | bigint;
}>, config?: SorobanFeeGuardConfig): Promise<{
    allowed: boolean;
    violation?: RuleViolation;
    feeStroops: bigint;
}>;
//# sourceMappingURL=soroban_fee_guard.d.ts.map