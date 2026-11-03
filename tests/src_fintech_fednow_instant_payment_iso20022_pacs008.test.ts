import { describe, it, expect } from 'vitest';
import { FednowInstantPaymentIso20022Pacs008 } from '../src/fintech/fednow_instant_payment_iso20022_pacs008.js';

describe('FednowInstantPaymentIso20022Pacs008 Invariant Suite (#1990)', () => {
  it('correctly intercepts dangerous pattern', () => {
    const result = FednowInstantPaymentIso20022Pacs008.inspect('rm -rf /production');
    expect(result.isThreat).toBe(true);
    expect(result.invariant).toBe('RULE_INVARIANT_FEDNOW_INSTANT_PAYMENT_ISO20022_PACS008');
    expect(FednowInstantPaymentIso20022Pacs008.validate('rm -rf /production')).toBe(false);
  });

  it('permits verified safe engineering command', () => {
    const result = FednowInstantPaymentIso20022Pacs008.inspect('git status && npm run test');
    expect(result.isThreat).toBe(false);
    expect(FednowInstantPaymentIso20022Pacs008.validate('git status && npm run test')).toBe(true);
  });
});
