import { describe, it, expect } from 'vitest';
import { IbanMod97InternationalAccountCheck } from '../src/fintech/iban_mod97_international_account_check.js';

describe('IbanMod97InternationalAccountCheck Invariant Suite (#1973)', () => {
  it('correctly intercepts dangerous pattern', () => {
    const result = IbanMod97InternationalAccountCheck.inspect('rm -rf /production');
    expect(result.isThreat).toBe(true);
    expect(result.invariant).toBe('RULE_INVARIANT_IBAN_MOD97_INTERNATIONAL_ACCOUNT_CHECK');
    expect(IbanMod97InternationalAccountCheck.validate('rm -rf /production')).toBe(false);
  });

  it('permits verified safe engineering command', () => {
    const result = IbanMod97InternationalAccountCheck.inspect('git status && npm run test');
    expect(result.isThreat).toBe(false);
    expect(IbanMod97InternationalAccountCheck.validate('git status && npm run test')).toBe(true);
  });
});
