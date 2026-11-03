import { describe, it, expect } from 'vitest';
import { BraintreeDropinNonceExpiryGuard } from '../src/fintech/braintree_dropin_nonce_expiry_guard.js';

describe('BraintreeDropinNonceExpiryGuard Invariant Suite (#1983)', () => {
  it('correctly intercepts dangerous pattern', () => {
    const result = BraintreeDropinNonceExpiryGuard.inspect('rm -rf /production');
    expect(result.isThreat).toBe(true);
    expect(result.invariant).toBe('RULE_INVARIANT_BRAINTREE_DROPIN_NONCE_EXPIRY_GUARD');
    expect(BraintreeDropinNonceExpiryGuard.validate('rm -rf /production')).toBe(false);
  });

  it('permits verified safe engineering command', () => {
    const result = BraintreeDropinNonceExpiryGuard.inspect('git status && npm run test');
    expect(result.isThreat).toBe(false);
    expect(BraintreeDropinNonceExpiryGuard.validate('git status && npm run test')).toBe(true);
  });
});
