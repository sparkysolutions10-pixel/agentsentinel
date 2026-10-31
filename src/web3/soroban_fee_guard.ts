/**
 * AgentSentinel - Soroban State Rent & Fee Surge Defense Rule
 * Protects autonomous AI agents and dApps from Stellar/Soroban storage rent spikes,
 * predatory fee surges, and uint32 overflow transaction simulation crashes.
 */

import { SentinelRule, ToolCallContext, RuleViolation, Verdict, ToolCategory } from '../types.js';

export const UINT32_MAX = 4_294_967_295n; // 2^32 - 1 (Maximum uint32 limit in stroops)
export const STROOPS_PER_XLM = 10_000_000n; // 1 XLM = 10,000,000 Stroops
export const DEFAULT_MAX_FEE_XLM = 10; // 10 XLM default max fee
export const DEFAULT_MAX_FEE_STROOPS = BigInt(DEFAULT_MAX_FEE_XLM) * STROOPS_PER_XLM; // 100,000,000 stroops
export const DEFAULT_MAX_RENT_PER_KB_STROOPS = 50_000n; // normal baseline is ~10,000 stroops/KB
export const DEFAULT_MAX_GROWTH_FACTOR = 1_000;

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
export function parseStroops(val: unknown): bigint {
  if (val === null || val === undefined) return 0n;
  if (typeof val === 'bigint') return val;
  if (typeof val === 'number') {
    if (isNaN(val) || !isFinite(val)) return 0n;
    return BigInt(Math.floor(val));
  }
  if (typeof val === 'string') {
    const clean = val.trim();
    if (!clean) return 0n;
    
    // Check if denominated in XLM e.g. "10 XLM", "2400XLM", "0.5 xlm"
    const xlmMatch = clean.match(/^([\d.]+)\s*xlm$/i);
    if (xlmMatch) {
      const numXlm = parseFloat(xlmMatch[1]);
      if (isNaN(numXlm)) return 0n;
      return BigInt(Math.round(numXlm * Number(STROOPS_PER_XLM)));
    }

    try {
      // Direct stroop integer string
      return BigInt(clean);
    } catch {
      return 0n;
    }
  }
  return 0n;
}

/**
 * Formats a BigInt stroop amount into human-readable XLM string.
 */
export function formatStroopsToXlm(stroops: bigint): string {
  const xlm = Number(stroops) / Number(STROOPS_PER_XLM);
  // Avoid unnecessary decimal precision for whole numbers
  if (Number.isInteger(xlm)) {
    return `${xlm} XLM`;
  }
  return `${xlm.toFixed(4).replace(/\.?0+$/, '')} XLM`;
}

/**
 * Checks if a tool call context belongs to Soroban / Stellar execution.
 */
export function isSorobanOrStellarContext(ctx: ToolCallContext): boolean {
  const name = ctx.toolName.toLowerCase();
  if (
    name.includes('soroban') ||
    name.includes('stellar') ||
    name.includes('invokehostfunction') ||
    name.includes('invokecontract') ||
    name.includes('preparetransaction') ||
    name.includes('feebump') ||
    name.includes('simulatetransaction')
  ) {
    return true;
  }

  // Also inspect tool parameters for Soroban markers
  const p = ctx.params || {};
  return Boolean(
    p.sorobanData ||
    p.minResourceFee !== undefined ||
    p.min_resource_fee !== undefined ||
    p.simulatedMinResourceFee !== undefined ||
    p.resourceFee !== undefined ||
    p.rentFee !== undefined ||
    p.rentPerKb !== undefined ||
    p.stroops !== undefined ||
    p.simulatedFeeXlm !== undefined ||
    (p.baseFee !== undefined && p.networkPassphrase?.toLowerCase().includes('stellar'))
  );
}

/**
 * Creates the Soroban State Rent & Fee Surge Guard SentinelRule.
 */
export function createSorobanFeeSurgeGuardRule(config: SorobanFeeGuardConfig = {}): SentinelRule {
  const maxFeeXlm = config.maxFeeXlm ?? config.maxAllowedFeeXlm ?? DEFAULT_MAX_FEE_XLM;
  const maxFeeStroops = config.maxFeeStroops !== undefined
    ? parseStroops(config.maxFeeStroops)
    : (config.maxAllowedFeeStroops !== undefined
      ? parseStroops(config.maxAllowedFeeStroops)
      : BigInt(maxFeeXlm) * STROOPS_PER_XLM);
  const maxRentPerKb = config.maxRentPerKbStroops !== undefined ? parseStroops(config.maxRentPerKbStroops) : DEFAULT_MAX_RENT_PER_KB_STROOPS;
  const maxGrowthFactor = config.maxGrowthFactor ?? DEFAULT_MAX_GROWTH_FACTOR;
  const uint32Protection = config.enableUint32OverflowProtection ?? true;

  return {
    id: 'soroban-fee-surge-guard',
    name: 'Soroban State Rent & Fee Surge Defense Guard',
    category: 'custom' as ToolCategory,
    priority: 950,
    enabled: true,
    evaluate: (ctx: ToolCallContext): RuleViolation | null => {
      if (!isSorobanOrStellarContext(ctx)) {
        return null; // Not a Soroban/Stellar invocation
      }

      const params = ctx.params || {};

      // 1. Check storage rent rate & archival spike
      const rentPerKb = parseStroops(params.rentPerKb ?? params.rent_per_kb);
      if (rentPerKb > maxRentPerKb) {
        return {
          ruleId: 'soroban-fee-surge-guard',
          ruleName: 'Soroban State Rent & Fee Surge Defense Guard',
          severity: 'critical',
          verdict: Verdict.BLOCK,
          reason: `Soroban state rent circuit breaker tripped: storage rent rate of ${rentPerKb} stroops/KB exceeds maximum safety threshold of ${maxRentPerKb} stroops/KB. Halting transaction to prevent excessive archival rent spend.`,
          detectedPattern: `rentPerKb: ${rentPerKb} > ${maxRentPerKb}`,
        };
      }

      // Check exponential growth factor
      const growthFactor = Number(params.growthFactor ?? params.growth_factor ?? 1);
      if (growthFactor > maxGrowthFactor) {
        return {
          ruleId: 'soroban-fee-surge-guard',
          ruleName: 'Soroban State Rent & Fee Surge Defense Guard',
          severity: 'critical',
          verdict: Verdict.BLOCK,
          reason: `Soroban state rent circuit breaker tripped: exponential growth factor ${growthFactor} exceeds safety threshold ${maxGrowthFactor}. Storage footprint spike detected.`,
          detectedPattern: `growthFactor: ${growthFactor} > ${maxGrowthFactor}`,
        };
      }

      // 2. Extract and calculate Total Fee (including Soroban RPC minResourceFee)
      const baseFee = parseStroops(params.baseFee ?? params.base_fee);
      const resourceFee = parseStroops(
        params.minResourceFee ??
        params.min_resource_fee ??
        params.simulatedMinResourceFee ??
        params.resourceFee ??
        params.resource_fee ??
        params.sorobanData?.resourceFee ??
        params.sorobanData?.minResourceFee
      );
      const rentFee = parseStroops(params.rentFee ?? params.rent_fee);
      const explicitFee = parseStroops(
        params.fee ??
        params.maxFee ??
        params.max_fee ??
        params.totalFee ??
        (params.simulatedFeeXlm !== undefined ? `${params.simulatedFeeXlm} XLM` : undefined)
      );
      const feeBump = parseStroops(params.feeBump ?? params.fee_bump);

      let totalCalculatedFee = 0n;
      if (explicitFee > 0n) {
        totalCalculatedFee = explicitFee;
      } else if (feeBump > 0n) {
        totalCalculatedFee = feeBump;
      } else {
        totalCalculatedFee = baseFee + resourceFee + rentFee;
      }

      // 3. Uint32 Overflow Tripwire Check
      if (uint32Protection && totalCalculatedFee > UINT32_MAX) {
        return {
          ruleId: 'soroban-fee-surge-guard',
          ruleName: 'Soroban State Rent & Fee Surge Defense Guard',
          severity: 'critical',
          verdict: Verdict.BLOCK,
          reason: `Soroban uint32 fee overflow prevented: calculated transaction fee of ${formatStroopsToXlm(totalCalculatedFee)} (${totalCalculatedFee} stroops) exceeds maximum 32-bit uint32 boundary (4,294,967,295). Transaction simulation will fail with integer overflow.`,
          detectedPattern: `totalCalculatedFee: ${totalCalculatedFee} > uint32::MAX`,
        };
      }

      // 4. Fee Surge Cap Check
      if (totalCalculatedFee > maxFeeStroops) {
        return {
          ruleId: 'soroban-fee-surge-guard',
          ruleName: 'Soroban State Rent & Fee Surge Defense Guard',
          severity: 'high',
          verdict: Verdict.BLOCK,
          reason: `Soroban fee surge detected: estimated fee of ${formatStroopsToXlm(totalCalculatedFee)} (${totalCalculatedFee} stroops) exceeds safety ceiling of ${maxFeeXlm} XLM. Halting transaction to prevent wallet fund exhaustion.`,
          detectedPattern: `fee: ${totalCalculatedFee} > ceiling: ${maxFeeStroops}`,
        };
      }

      // Clean, compliant transaction
      return null;
    },
  };
}

/**
 * Convenience helper to simulate Soroban transactions and assert safety against Fee Surges.
 */
export async function simulateSorobanTransactionWithGuard(
  simulationFn: () => Promise<{ minResourceFee?: string | number | bigint; fee?: string | number | bigint; resourceFee?: string | number | bigint }>,
  config: SorobanFeeGuardConfig = {}
): Promise<{ allowed: boolean; violation?: RuleViolation; feeStroops: bigint }> {
  const guard = createSorobanFeeSurgeGuardRule(config);
  const result = await simulationFn();

  const ctx: ToolCallContext = {
    id: `soroban-sim-${Date.now()}`,
    toolName: 'soroban_simulateTransaction',
    category: 'custom',
    params: {
      minResourceFee: result.minResourceFee,
      resourceFee: result.resourceFee ?? result.minResourceFee,
      fee: result.fee,
    },
    timestamp: Date.now(),
  };

  const violationResult = guard.evaluate(ctx);
  const violation = violationResult instanceof Promise ? await violationResult : violationResult;
  const totalStroops = parseStroops(result.fee ?? result.minResourceFee ?? result.resourceFee);

  return {
    allowed: violation === null,
    violation: violation ?? undefined,
    feeStroops: totalStroops,
  };
}
