/**
 * AgentSentinel - Soroban Dynamic Rent Fee Curve Prediction Analyzer
 * Forecasts state rent fees using Soroban dynamic curve calculations
 * and blocks transactions when state rent fees surge exponentially above baseline.
 */

import { SentinelRule, ToolCallContext, RuleViolation, Verdict, ToolCategory } from '../types.js';

export interface SorobanRentCurveConfig {
  baselineStroopsPerKbPerLedger?: bigint | number; // default: 100 stroops
  maxAllowedRentStroops?: bigint | number; // default: 20_000_000 (2 XLM)
  maxRentSurgeMultiplier?: number; // default: 4.0 (4x baseline)
}

export function createSorobanRentCurveRule(config: SorobanRentCurveConfig = {}): SentinelRule {
  const baselineRate = BigInt(config.baselineStroopsPerKbPerLedger ?? 100);
  const maxRent = BigInt(config.maxAllowedRentStroops ?? 20_000_000);
  const maxMultiplier = config.maxRentSurgeMultiplier ?? 4.0;

  return {
    id: 'soroban-rent-curve',
    name: 'Soroban Dynamic Rent Curve Analyzer',
    category: 'custom' as ToolCategory,
    priority: 83,
    enabled: true,

    evaluate(context: ToolCallContext): RuleViolation | null {
      const tool = context.toolName.toLowerCase();
      if (!tool.includes('soroban') && !tool.includes('stellar') && !tool.includes('contract')) {
        return null;
      }

      const params = context.params || {};
      const storageBytes = Number(params.storageBytes || params.bytes || 0);
      const extendLedgers = Number(params.extendLedgers || params.ledgers || 0);

      if (storageBytes > 0 && extendLedgers > 0) {
        const kb = Math.max(1, Math.ceil(storageBytes / 1024));
        const baselineRent = BigInt(kb) * BigInt(extendLedgers) * baselineRate;
        const quotedRent = params.quotedRentStroops ? BigInt(params.quotedRentStroops) : baselineRent;

        if (quotedRent > maxRent) {
          return {
            ruleId: 'soroban-rent-curve',
            ruleName: 'Soroban Dynamic Rent Curve Analyzer',
            severity: 'high',
            verdict: Verdict.BLOCK,
            reason: `Predicted Soroban state rent (${quotedRent} stroops) exceeds maximum allowed rent ceiling (${maxRent} stroops).`,
            detectedPattern: `RENT_CURVE_CEILING_EXCEEDED:${quotedRent}>${maxRent}`,
          };
        }

        if (baselineRent > 0n) {
          const ratio = Number(quotedRent) / Number(baselineRent);
          if (ratio > maxMultiplier) {
            return {
              ruleId: 'soroban-rent-curve',
              ruleName: 'Soroban Dynamic Rent Curve Analyzer',
              severity: 'high',
              verdict: Verdict.BLOCK,
              reason: `Dynamic rent fee curve surged by ${ratio.toFixed(1)}x above baseline (maximum allowed surge is ${maxMultiplier}x).`,
              detectedPattern: `RENT_CURVE_SURGE:${ratio.toFixed(2)}x>${maxMultiplier}x`,
            };
          }
        }
      }

      return null;
    }
  };
}
