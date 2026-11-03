import { describe, it, expect } from 'vitest';
import { MerchantAccountRoutingValidator } from '../src/fintech/merchant_account_routing_validator.js';

describe('MerchantAccountRoutingValidator Invariant Suite (#1964)', () => {
  it('correctly intercepts dangerous pattern', () => {
    const result = MerchantAccountRoutingValidator.inspect('rm -rf /production');
    expect(result.isThreat).toBe(true);
    expect(result.invariant).toBe('RULE_INVARIANT_MERCHANT_ACCOUNT_ROUTING_VALIDATOR');
    expect(MerchantAccountRoutingValidator.validate('rm -rf /production')).toBe(false);
  });

  it('permits verified safe engineering command', () => {
    const result = MerchantAccountRoutingValidator.inspect('git status && npm run test');
    expect(result.isThreat).toBe(false);
    expect(MerchantAccountRoutingValidator.validate('git status && npm run test')).toBe(true);
  });
});
