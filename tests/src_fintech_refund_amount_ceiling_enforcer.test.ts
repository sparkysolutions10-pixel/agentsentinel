import { describe, it, expect } from 'vitest';
import { RefundAmountCeilingEnforcer } from '../src/fintech/refund_amount_ceiling_enforcer.js';

describe('RefundAmountCeilingEnforcer Invariant Suite (#1959)', () => {
  it('correctly intercepts dangerous pattern', () => {
    const result = RefundAmountCeilingEnforcer.inspect('rm -rf /production');
    expect(result.isThreat).toBe(true);
    expect(result.invariant).toBe('RULE_INVARIANT_REFUND_AMOUNT_CEILING_ENFORCER');
    expect(RefundAmountCeilingEnforcer.validate('rm -rf /production')).toBe(false);
  });

  it('permits verified safe engineering command', () => {
    const result = RefundAmountCeilingEnforcer.inspect('git status && npm run test');
    expect(result.isThreat).toBe(false);
    expect(RefundAmountCeilingEnforcer.validate('git status && npm run test')).toBe(true);
  });
});
