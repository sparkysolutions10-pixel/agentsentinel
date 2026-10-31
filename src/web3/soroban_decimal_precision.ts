/**
 * AgentSentinel - i128 Decimal Precision Overflow and Rounding Checker
 * Verifies mathematical calculations and token values inside Soroban invocations
 * never truncate or overflow i128 bounds (-2^127 to 2^127 - 1) or lose precision beyond token decimals.
 */

import { SentinelRule, ToolCallContext, RuleViolation, Verdict, ToolCategory } from '../types.js';

export interface SorobanDecimalPrecisionConfig {
  maxDecimals?: number; // default: 7 (Stellar native stroop precision)
}

const I128_MAX = BigInt('170141183460469231731687303715884105727');
const I128_MIN = BigInt('-170141183460469231731687303715884105728');

export function createSorobanDecimalPrecisionCheckerRule(config: SorobanDecimalPrecisionConfig = {}): SentinelRule {
  const maxDecimals = config.maxDecimals ?? 7;

  return {
    id: 'soroban-decimal-precision-checker',
    name: 'Soroban i128 Decimal Precision Checker',
    category: 'custom' as ToolCategory,
    priority: 84,
    enabled: true,

    evaluate(context: ToolCallContext): RuleViolation | null {
      const tool = context.toolName.toLowerCase();
      if (!tool.includes('token') && !tool.includes('soroban') && !tool.includes('stellar') && !tool.includes('math')) {
        return null;
      }

      const params = context.params || {};
      const amount = params.amount ?? params.value ?? params.quantity ?? params.balance;
      if (amount === undefined || amount === null) {
        return null;
      }

      const strVal = String(amount).trim();

      // Check decimal fraction precision
      if (strVal.includes('.')) {
        const parts = strVal.split('.');
        const fraction = parts[1];
        if (fraction.length > maxDecimals) {
          return {
            ruleId: 'soroban-decimal-precision-checker',
            ruleName: 'Soroban i128 Decimal Precision Checker',
            severity: 'high',
            verdict: Verdict.BLOCK,
            reason: `Decimal value (${strVal}) has ${fraction.length} fractional digits, exceeding the maximum allowed precision (${maxDecimals} decimals). Arithmetic truncation risk.`,
            detectedPattern: `DECIMAL_PRECISION_OVERFLOW:${fraction.length}>${maxDecimals}`,
          };
        }
      }

      // Check i128 integer overflow
      try {
        const intValStr = strVal.split('.')[0];
        if (intValStr && intValStr !== '-') {
          const bigVal = BigInt(intValStr);
          if (bigVal > I128_MAX || bigVal < I128_MIN) {
            return {
              ruleId: 'soroban-decimal-precision-checker',
              ruleName: 'Soroban i128 Decimal Precision Checker',
              severity: 'critical',
              verdict: Verdict.BLOCK,
              reason: `Integer amount (${strVal}) exceeds standard i128 bounds. Potential arithmetic overflow vulnerability.`,
              detectedPattern: `I128_OVERFLOW_EXCEEDED:${strVal}`,
            };
          }
        }
      } catch {
        // ignore non-integer parse errors
      }

      return null;
    }
  };
}
