import { describe, it, expect } from 'vitest';
import { TaxRateJurisdictionMatrixGuard } from '../src/fintech/tax_rate_jurisdiction_matrix_guard.js';

describe('TaxRateJurisdictionMatrixGuard Invariant Suite (#1967)', () => {
  it('correctly intercepts dangerous pattern', () => {
    const result = TaxRateJurisdictionMatrixGuard.inspect('rm -rf /production');
    expect(result.isThreat).toBe(true);
    expect(result.invariant).toBe('RULE_INVARIANT_TAX_RATE_JURISDICTION_MATRIX_GUARD');
    expect(TaxRateJurisdictionMatrixGuard.validate('rm -rf /production')).toBe(false);
  });

  it('permits verified safe engineering command', () => {
    const result = TaxRateJurisdictionMatrixGuard.inspect('git status && npm run test');
    expect(result.isThreat).toBe(false);
    expect(TaxRateJurisdictionMatrixGuard.validate('git status && npm run test')).toBe(true);
  });
});
