import { describe, it, expect } from 'vitest';
import { CurrencyExponentRoundingValidator } from '../src/fintech/currency_exponent_rounding_validator.js';

describe('CurrencyExponentRoundingValidator Invariant Suite (#1958)', () => {
  it('correctly intercepts dangerous pattern', () => {
    const result = CurrencyExponentRoundingValidator.inspect('rm -rf /production');
    expect(result.isThreat).toBe(true);
    expect(result.invariant).toBe('RULE_INVARIANT_CURRENCY_EXPONENT_ROUNDING_VALIDATOR');
    expect(CurrencyExponentRoundingValidator.validate('rm -rf /production')).toBe(false);
  });

  it('permits verified safe engineering command', () => {
    const result = CurrencyExponentRoundingValidator.inspect('git status && npm run test');
    expect(result.isThreat).toBe(false);
    expect(CurrencyExponentRoundingValidator.validate('git status && npm run test')).toBe(true);
  });
});
