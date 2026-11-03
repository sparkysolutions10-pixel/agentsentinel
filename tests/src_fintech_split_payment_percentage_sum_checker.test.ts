import { describe, it, expect } from 'vitest';
import { SplitPaymentPercentageSumChecker } from '../src/fintech/split_payment_percentage_sum_checker.js';

describe('SplitPaymentPercentageSumChecker Invariant Suite (#1965)', () => {
  it('correctly intercepts dangerous pattern', () => {
    const result = SplitPaymentPercentageSumChecker.inspect('rm -rf /production');
    expect(result.isThreat).toBe(true);
    expect(result.invariant).toBe('RULE_INVARIANT_SPLIT_PAYMENT_PERCENTAGE_SUM_CHECKER');
    expect(SplitPaymentPercentageSumChecker.validate('rm -rf /production')).toBe(false);
  });

  it('permits verified safe engineering command', () => {
    const result = SplitPaymentPercentageSumChecker.inspect('git status && npm run test');
    expect(result.isThreat).toBe(false);
    expect(SplitPaymentPercentageSumChecker.validate('git status && npm run test')).toBe(true);
  });
});
