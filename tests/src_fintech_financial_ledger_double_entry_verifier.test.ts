import { describe, it, expect } from 'vitest';
import { FinancialLedgerDoubleEntryVerifier } from '../src/fintech/financial_ledger_double_entry_verifier.js';

describe('FinancialLedgerDoubleEntryVerifier Invariant Suite (#1992)', () => {
  it('correctly intercepts dangerous pattern', () => {
    const result = FinancialLedgerDoubleEntryVerifier.inspect('rm -rf /production');
    expect(result.isThreat).toBe(true);
    expect(result.invariant).toBe('RULE_INVARIANT_FINANCIAL_LEDGER_DOUBLE_ENTRY_VERIFIER');
    expect(FinancialLedgerDoubleEntryVerifier.validate('rm -rf /production')).toBe(false);
  });

  it('permits verified safe engineering command', () => {
    const result = FinancialLedgerDoubleEntryVerifier.inspect('git status && npm run test');
    expect(result.isThreat).toBe(false);
    expect(FinancialLedgerDoubleEntryVerifier.validate('git status && npm run test')).toBe(true);
  });
});
