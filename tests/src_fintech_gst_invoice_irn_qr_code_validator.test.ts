import { describe, it, expect } from 'vitest';
import { GstInvoiceIrnQrCodeValidator } from '../src/fintech/gst_invoice_irn_qr_code_validator.js';

describe('GstInvoiceIrnQrCodeValidator Invariant Suite (#1966)', () => {
  it('correctly intercepts dangerous pattern', () => {
    const result = GstInvoiceIrnQrCodeValidator.inspect('rm -rf /production');
    expect(result.isThreat).toBe(true);
    expect(result.invariant).toBe('RULE_INVARIANT_GST_INVOICE_IRN_QR_CODE_VALIDATOR');
    expect(GstInvoiceIrnQrCodeValidator.validate('rm -rf /production')).toBe(false);
  });

  it('permits verified safe engineering command', () => {
    const result = GstInvoiceIrnQrCodeValidator.inspect('git status && npm run test');
    expect(result.isThreat).toBe(false);
    expect(GstInvoiceIrnQrCodeValidator.validate('git status && npm run test')).toBe(true);
  });
});
