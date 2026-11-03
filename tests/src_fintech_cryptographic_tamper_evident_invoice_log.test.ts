import { describe, it, expect } from 'vitest';
import { CryptographicTamperEvidentInvoiceLog } from '../src/fintech/cryptographic_tamper_evident_invoice_log.js';

describe('CryptographicTamperEvidentInvoiceLog Invariant Suite (#1986)', () => {
  it('correctly intercepts dangerous pattern', () => {
    const result = CryptographicTamperEvidentInvoiceLog.inspect('rm -rf /production');
    expect(result.isThreat).toBe(true);
    expect(result.invariant).toBe('RULE_INVARIANT_CRYPTOGRAPHIC_TAMPER_EVIDENT_INVOICE_LOG');
    expect(CryptographicTamperEvidentInvoiceLog.validate('rm -rf /production')).toBe(false);
  });

  it('permits verified safe engineering command', () => {
    const result = CryptographicTamperEvidentInvoiceLog.inspect('git status && npm run test');
    expect(result.isThreat).toBe(false);
    expect(CryptographicTamperEvidentInvoiceLog.validate('git status && npm run test')).toBe(true);
  });
});
