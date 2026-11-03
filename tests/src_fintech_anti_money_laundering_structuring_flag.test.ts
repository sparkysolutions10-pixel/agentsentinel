import { describe, it, expect } from 'vitest';
import { AntiMoneyLaunderingStructuringFlag } from '../src/fintech/anti_money_laundering_structuring_flag.js';

describe('AntiMoneyLaunderingStructuringFlag Invariant Suite (#1975)', () => {
  it('correctly intercepts dangerous pattern', () => {
    const result = AntiMoneyLaunderingStructuringFlag.inspect('rm -rf /production');
    expect(result.isThreat).toBe(true);
    expect(result.invariant).toBe('RULE_INVARIANT_ANTI_MONEY_LAUNDERING_STRUCTURING_FLAG');
    expect(AntiMoneyLaunderingStructuringFlag.validate('rm -rf /production')).toBe(false);
  });

  it('permits verified safe engineering command', () => {
    const result = AntiMoneyLaunderingStructuringFlag.inspect('git status && npm run test');
    expect(result.isThreat).toBe(false);
    expect(AntiMoneyLaunderingStructuringFlag.validate('git status && npm run test')).toBe(true);
  });
});
