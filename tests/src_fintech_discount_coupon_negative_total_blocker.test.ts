import { describe, it, expect } from 'vitest';
import { DiscountCouponNegativeTotalBlocker } from '../src/fintech/discount_coupon_negative_total_blocker.js';

describe('DiscountCouponNegativeTotalBlocker Invariant Suite (#1969)', () => {
  it('correctly intercepts dangerous pattern', () => {
    const result = DiscountCouponNegativeTotalBlocker.inspect('rm -rf /production');
    expect(result.isThreat).toBe(true);
    expect(result.invariant).toBe('RULE_INVARIANT_DISCOUNT_COUPON_NEGATIVE_TOTAL_BLOCKER');
    expect(DiscountCouponNegativeTotalBlocker.validate('rm -rf /production')).toBe(false);
  });

  it('permits verified safe engineering command', () => {
    const result = DiscountCouponNegativeTotalBlocker.inspect('git status && npm run test');
    expect(result.isThreat).toBe(false);
    expect(DiscountCouponNegativeTotalBlocker.validate('git status && npm run test')).toBe(true);
  });
});
