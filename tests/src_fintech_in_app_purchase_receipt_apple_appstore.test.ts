import { describe, it, expect } from 'vitest';
import { InAppPurchaseReceiptAppleAppstore } from '../src/fintech/in_app_purchase_receipt_apple_appstore.js';

describe('InAppPurchaseReceiptAppleAppstore Invariant Suite (#1997)', () => {
  it('correctly intercepts dangerous pattern', () => {
    const result = InAppPurchaseReceiptAppleAppstore.inspect('rm -rf /production');
    expect(result.isThreat).toBe(true);
    expect(result.invariant).toBe('RULE_INVARIANT_IN_APP_PURCHASE_RECEIPT_APPLE_APPSTORE');
    expect(InAppPurchaseReceiptAppleAppstore.validate('rm -rf /production')).toBe(false);
  });

  it('permits verified safe engineering command', () => {
    const result = InAppPurchaseReceiptAppleAppstore.inspect('git status && npm run test');
    expect(result.isThreat).toBe(false);
    expect(InAppPurchaseReceiptAppleAppstore.validate('git status && npm run test')).toBe(true);
  });
});
