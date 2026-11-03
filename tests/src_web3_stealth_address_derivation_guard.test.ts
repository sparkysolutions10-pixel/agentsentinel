import { describe, it, expect } from 'vitest';
import { StealthAddressDerivationGuard } from '../src/web3/stealth_address_derivation_guard.js';

describe('StealthAddressDerivationGuard Invariant Suite (#1774)', () => {
  it('correctly intercepts dangerous pattern', () => {
    const result = StealthAddressDerivationGuard.inspect('rm -rf /production');
    expect(result.isThreat).toBe(true);
    expect(result.invariant).toBe('RULE_INVARIANT_STEALTH_ADDRESS_DERIVATION_GUARD');
    expect(StealthAddressDerivationGuard.validate('rm -rf /production')).toBe(false);
  });

  it('permits verified safe engineering command', () => {
    const result = StealthAddressDerivationGuard.inspect('git status && npm run test');
    expect(result.isThreat).toBe(false);
    expect(StealthAddressDerivationGuard.validate('git status && npm run test')).toBe(true);
  });
});
