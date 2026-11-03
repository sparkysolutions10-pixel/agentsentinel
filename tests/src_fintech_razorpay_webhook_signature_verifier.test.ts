import { describe, it, expect } from 'vitest';
import { RazorpayWebhookSignatureVerifier } from '../src/fintech/razorpay_webhook_signature_verifier.js';

describe('RazorpayWebhookSignatureVerifier Invariant Suite (#1954)', () => {
  it('correctly intercepts dangerous pattern', () => {
    const result = RazorpayWebhookSignatureVerifier.inspect('rm -rf /production');
    expect(result.isThreat).toBe(true);
    expect(result.invariant).toBe('RULE_INVARIANT_RAZORPAY_WEBHOOK_SIGNATURE_VERIFIER');
    expect(RazorpayWebhookSignatureVerifier.validate('rm -rf /production')).toBe(false);
  });

  it('permits verified safe engineering command', () => {
    const result = RazorpayWebhookSignatureVerifier.inspect('git status && npm run test');
    expect(result.isThreat).toBe(false);
    expect(RazorpayWebhookSignatureVerifier.validate('git status && npm run test')).toBe(true);
  });
});
