import { describe, it, expect } from 'vitest';
import { PaypalPayoutBatchLimitEnforcer } from '../src/fintech/paypal_payout_batch_limit_enforcer.js';

describe('PaypalPayoutBatchLimitEnforcer Invariant Suite (#1984)', () => {
  it('correctly intercepts dangerous pattern', () => {
    const result = PaypalPayoutBatchLimitEnforcer.inspect('rm -rf /production');
    expect(result.isThreat).toBe(true);
    expect(result.invariant).toBe('RULE_INVARIANT_PAYPAL_PAYOUT_BATCH_LIMIT_ENFORCER');
    expect(PaypalPayoutBatchLimitEnforcer.validate('rm -rf /production')).toBe(false);
  });

  it('permits verified safe engineering command', () => {
    const result = PaypalPayoutBatchLimitEnforcer.inspect('git status && npm run test');
    expect(result.isThreat).toBe(false);
    expect(PaypalPayoutBatchLimitEnforcer.validate('git status && npm run test')).toBe(true);
  });
});
