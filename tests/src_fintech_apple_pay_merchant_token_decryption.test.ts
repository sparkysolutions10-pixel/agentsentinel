import { describe, it, expect } from 'vitest';
import { ApplePayMerchantTokenDecryption } from '../src/fintech/apple_pay_merchant_token_decryption.js';

describe('ApplePayMerchantTokenDecryption Invariant Suite (#1979)', () => {
  it('correctly intercepts dangerous pattern', () => {
    const result = ApplePayMerchantTokenDecryption.inspect('rm -rf /production');
    expect(result.isThreat).toBe(true);
    expect(result.invariant).toBe('RULE_INVARIANT_APPLE_PAY_MERCHANT_TOKEN_DECRYPTION');
    expect(ApplePayMerchantTokenDecryption.validate('rm -rf /production')).toBe(false);
  });

  it('permits verified safe engineering command', () => {
    const result = ApplePayMerchantTokenDecryption.inspect('git status && npm run test');
    expect(result.isThreat).toBe(false);
    expect(ApplePayMerchantTokenDecryption.validate('git status && npm run test')).toBe(true);
  });
});
