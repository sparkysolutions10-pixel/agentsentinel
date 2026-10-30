/**
 * AgentSentinel - Soroban State Rent & Fee Surge Defense Rule
 * Protects autonomous AI agents and dApps from Stellar/Soroban storage rent spikes,
 * predatory fee surges, and uint32 overflow transaction simulation crashes.
 */

import { SentinelRule, ToolCallContext, RuleViolation, Verdict, ToolCategory } from '../types.js';

export const UINT32_MAX = 4_294_967_295n;
export const STROOPS_PER_XLM = 10_000_000n;
export const DEFAULT_MAX_FEE_XLM = 10; // 10 XLM default max fee
export const DEFAULT_MAX_FEE_STROOPS = BigInt(DEFAULT_MAX_FEE_XLM) * STROOPS_PER_XLM; // 100,000,000 stroops
export const DEFAULT_MAX_RENT_PER_KB_STROOPS = 50_000n; // normal baseline is ~10,000 stroops/KB
export const DEFAULT_MAX_GROWTH_FACTOR = 1_000;

export interface SorobanFeeGuardConfig {
  maxFeeXlm?: number;
  maxFeeStroops?: bigint | number | string;
  maxRentPerKbStroops?: bigint | number | string;
  maxGrowthFactor?: number;
  enableUint32OverflowProtection?: boolean;
  enableCircuitBreaker?: boolean;
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
    const trimmed = val.trim();
    if (!trimmed) return 0n;

    // Check if explicitly denominated in XLM (e.g. "2400 XLM", "10.5xlm")
    const xlmMatch = trimmed.match(/^([\d.]+)\s*xlm$/i);
    if (xlmMatch) {
      const num = parseFloat(xlmMatch[1]);
      if (isNaN(num)) return 0n;
      return BigInt(Math.floor(num * 10_000_000));
    }

    // Clean numeric stroop string
    const numOnly = trimmed.replace(/[^\d]/g, '');
    if (numOnly) {
      try {
        return BigInt(numOnly);
      } catch {
        return 0n;
      }
    }
  }
  return 0n;
}

/**
 * Formats a BigInt stroops amount into human-readable XLM string.
 */
export function formatStroopsToXlm(stroops: bigint): string {
  const integerPart = stroops / STROOPS_PER_XLM;
  const fractionalPart = stroops % STROOPS_PER_XLM;
  const fractionStr = fractionalPart.toString().padStart(7, '0').replace(/0+$/, '');
  return fractionStr ? `${integerPart}.${fractionStr} XLM` : `${integerPart} XLM`;
}

/**
 * Checks whether a given tool call context pertains to Stellar / Soroban transactions.
 */
export function isSorobanOrStellarContext(ctx: ToolCallContext): boolean {
  const name = ctx.toolName.toLowerCase();
  if (
    name.includes('soroban') ||
    name.includes('stellar') ||
    name.includes('invokehostfunction') ||
    name.includes('invokecontract') ||
    name.includes('preparetransaction') ||
    name.includes('feebump')
  ) {
    return true;
  }

  // Check params for Stellar / Soroban signature indicators
  const p = ctx.params || {};
  return Boolean(
    p.sorobanData ||
    p.resourceFee !== undefined ||
    p.rentFee !== undefined ||
    p.rentPerKb !== undefined ||
    p.stroops !== undefined ||
    (p.baseFee !== undefined && p.networkPassphrase?.toLowerCase().includes('stellar'))
  );
}

/**
 * Creates the Soroban State Rent & Fee Surge Guard SentinelRule.
 */
export function createSorobanFeeSurgeGuardRule(config: SorobanFeeGuardConfig = {}): SentinelRule {
  const maxFeeXlm = config.maxFeeXlm ?? DEFAULT_MAX_FEE_XLM;
  const maxFeeStroops = config.maxFeeStroops !== undefined ? parseStroops(config.maxFeeStroops) : BigInt(maxFeeXlm) * STROOPS_PER_XLM;
  const maxRentPerKb = config.maxRentPerKbStroops !== undefined ? parseStroops(config.maxRentPerKbStroops) : DEFAULT_MAX_RENT_PER_KB_STROOPS;
  const maxGrowthFactor = config.maxGrowthFactor ?? DEFAULT_MAX_GROWTH_FACTOR;
  const uint32Protection = config.enableUint32OverflowProtection ?? true;
  const circuitBreaker = config.enableCircuitBreaker ?? true;

  return {
    id: 'soroban-fee-surge-guard',
    name: 'Soroban State Rent & Fee Surge Defense Guard',
    category: 'custom' as ToolCategory,
    priority: 950,
    enabled: true,

    evaluate(ctx: ToolCallContext): RuleViolation | null {
      if (!isSorobanOrStellarContext(ctx)) {
        return null;
      }

      const params = ctx.params || {};

      // 1. Extract State Rent indicators
      const rentPerKb = parseStroops(params.rentPerKb ?? params.rent_per_kb ?? params.sorobanData?.rentPerKb);
      const growthFactor = typeof params.growthFactor === 'number' ? params.growthFactor : (typeof params.growth_factor === 'number' ? params.growth_factor : 0);

      if (circuitBreaker) {
        if (rentPerKb > 0n && rentPerKb > maxRentPerKb) {
          return {
            ruleId: 'soroban-fee-surge-guard',
            ruleName: 'Soroban State Rent & Fee Surge Defense Guard',
            severity: 'critical',
            verdict: Verdict.BLOCK,
            reason: `Soroban state rent circuit breaker tripped: current storage rent of ${rentPerKb} stroops/KB exceeds safety threshold of ${maxRentPerKb} stroops/KB. Network state storage congested.`,
            detectedPattern: `rentPerKb: ${rentPerKb}`,
          };
        }

        if (growthFactor > 0 && growthFactor > maxGrowthFactor) {
          return {
            ruleId: 'soroban-fee-surge-guard',
            ruleName: 'Soroban State Rent & Fee Surge Defense Guard',
            severity: 'critical',
            verdict: Verdict.BLOCK,
            reason: `Soroban state rent circuit breaker tripped: exponential growth factor ${growthFactor} exceeds safety threshold ${maxGrowthFactor}.`,
            detectedPattern: `growthFactor: ${growthFactor}`,
          };
        }
      }

      // 2. Extract and calculate Total Fee
      const baseFee = parseStroops(params.baseFee ?? params.base_fee);
      const resourceFee = parseStroops(params.resourceFee ?? params.resource_fee ?? params.sorobanData?.resourceFee);
      const rentFee = parseStroops(params.rentFee ?? params.rent_fee);
      const explicitFee = parseStroops(params.fee ?? params.maxFee ?? params.max_fee ?? params.totalFee);
      const feeBump = parseStroops(params.feeBump ?? params.fee_bump);

      let totalCalculatedFee = 0n;
      if (explicitFee > 0n) {
        totalCalculatedFee = explicitFee;
      } else if (resourceFee > 0n || baseFee > 0n || rentFee > 0n) {
        const ops = typeof params.operations === 'number' ? BigInt(params.operations) : 1n;
        totalCalculatedFee = (baseFee * ops) + resourceFee + rentFee;
      } else if (feeBump > 0n) {
        totalCalculatedFee = feeBump;
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
