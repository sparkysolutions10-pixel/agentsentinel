import { describe, it, expect } from 'vitest';
import { SubscriptionBillingCycleAnchorGuard } from '../src/fintech/subscription_billing_cycle_anchor_guard.js';

describe('SubscriptionBillingCycleAnchorGuard Invariant Suite (#1968)', () => {
  it('correctly intercepts dangerous pattern', () => {
    const result = SubscriptionBillingCycleAnchorGuard.inspect('rm -rf /production');
    expect(result.isThreat).toBe(true);
    expect(result.invariant).toBe('RULE_INVARIANT_SUBSCRIPTION_BILLING_CYCLE_ANCHOR_GUARD');
    expect(SubscriptionBillingCycleAnchorGuard.validate('rm -rf /production')).toBe(false);
  });

  it('permits verified safe engineering command', () => {
    const result = SubscriptionBillingCycleAnchorGuard.inspect('git status && npm run test');
    expect(result.isThreat).toBe(false);
    expect(SubscriptionBillingCycleAnchorGuard.validate('git status && npm run test')).toBe(true);
  });
});
