import { describe, it, expect } from 'vitest';
import { createSorobanDecimalPrecisionCheckerRule } from '../src/web3/soroban_decimal_precision.js';
import { Verdict } from '../src/types.js';

describe('SorobanDecimalPrecisionCheckerRule', () => {
  it('allows values with standard 7 decimal places', () => {
    const rule = createSorobanDecimalPrecisionCheckerRule();
    const violation = rule.evaluate({
      toolName: 'soroban_token_invoke',
      params: { amount: '123.4567890' }
    });
    expect(violation).toBeNull();
  });

  it('blocks values with excessive decimal fraction precision', () => {
    const rule = createSorobanDecimalPrecisionCheckerRule({ maxDecimals: 7 });
    const violation = rule.evaluate({
      toolName: 'soroban_token_invoke',
      params: { amount: '10.123456789' } // 9 decimals > 7
    });
    expect(violation).not.toBeNull();
    expect(violation?.verdict).toBe(Verdict.BLOCK);
    expect(violation?.detectedPattern).toContain('DECIMAL_PRECISION_OVERFLOW');
  });

  it('blocks values exceeding i128 maximum integer bounds', () => {
    const rule = createSorobanDecimalPrecisionCheckerRule();
    const violation = rule.evaluate({
      toolName: 'soroban_token_invoke',
      params: { amount: '9999999999999999999999999999999999999999999999' }
    });
    expect(violation).not.toBeNull();
    expect(violation?.verdict).toBe(Verdict.BLOCK);
    expect(violation?.severity).toBe('critical');
    expect(violation?.detectedPattern).toContain('I128_OVERFLOW_EXCEEDED');
  });
});
