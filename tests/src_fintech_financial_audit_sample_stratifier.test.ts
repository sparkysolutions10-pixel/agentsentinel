import { describe, it, expect } from 'vitest';
import { FinancialAuditSampleStratifier } from '../src/fintech/financial_audit_sample_stratifier.js';

describe('FinancialAuditSampleStratifier Invariant Suite (#2002)', () => {
  it('correctly intercepts dangerous pattern', () => {
    const result = FinancialAuditSampleStratifier.inspect('rm -rf /production');
    expect(result.isThreat).toBe(true);
    expect(result.invariant).toBe('RULE_INVARIANT_FINANCIAL_AUDIT_SAMPLE_STRATIFIER');
    expect(FinancialAuditSampleStratifier.validate('rm -rf /production')).toBe(false);
  });

  it('permits verified safe engineering command', () => {
    const result = FinancialAuditSampleStratifier.inspect('git status && npm run test');
    expect(result.isThreat).toBe(false);
    expect(FinancialAuditSampleStratifier.validate('git status && npm run test')).toBe(true);
  });
});
