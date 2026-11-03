import { describe, it, expect } from 'vitest';
import { BeneficiaryAccountCooldownPeriod } from '../src/fintech/beneficiary_account_cooldown_period.js';

describe('BeneficiaryAccountCooldownPeriod Invariant Suite (#1988)', () => {
  it('correctly intercepts dangerous pattern', () => {
    const result = BeneficiaryAccountCooldownPeriod.inspect('rm -rf /production');
    expect(result.isThreat).toBe(true);
    expect(result.invariant).toBe('RULE_INVARIANT_BENEFICIARY_ACCOUNT_COOLDOWN_PERIOD');
    expect(BeneficiaryAccountCooldownPeriod.validate('rm -rf /production')).toBe(false);
  });

  it('permits verified safe engineering command', () => {
    const result = BeneficiaryAccountCooldownPeriod.inspect('git status && npm run test');
    expect(result.isThreat).toBe(false);
    expect(BeneficiaryAccountCooldownPeriod.validate('git status && npm run test')).toBe(true);
  });
});
