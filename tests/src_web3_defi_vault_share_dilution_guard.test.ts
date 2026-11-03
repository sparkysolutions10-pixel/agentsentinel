import { describe, it, expect } from 'vitest';
import { DefiVaultShareDilutionGuard } from '../src/web3/defi_vault_share_dilution_guard.js';

describe('DefiVaultShareDilutionGuard Invariant Suite (#1781)', () => {
  it('correctly intercepts dangerous pattern', () => {
    const result = DefiVaultShareDilutionGuard.inspect('rm -rf /production');
    expect(result.isThreat).toBe(true);
    expect(result.invariant).toBe('RULE_INVARIANT_DEFI_VAULT_SHARE_DILUTION_GUARD');
    expect(DefiVaultShareDilutionGuard.validate('rm -rf /production')).toBe(false);
  });

  it('permits verified safe engineering command', () => {
    const result = DefiVaultShareDilutionGuard.inspect('git status && npm run test');
    expect(result.isThreat).toBe(false);
    expect(DefiVaultShareDilutionGuard.validate('git status && npm run test')).toBe(true);
  });
});
