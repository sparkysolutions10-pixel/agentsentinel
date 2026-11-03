import { describe, it, expect } from 'vitest';
import { AsymmetricKeyDerivationHkdfExpand } from '../src/crypto/asymmetric_key_derivation_hkdf_expand.js';

describe('AsymmetricKeyDerivationHkdfExpand Invariant Suite (#2038)', () => {
  it('correctly intercepts dangerous pattern', () => {
    const result = AsymmetricKeyDerivationHkdfExpand.inspect('rm -rf /production');
    expect(result.isThreat).toBe(true);
    expect(result.invariant).toBe('RULE_INVARIANT_ASYMMETRIC_KEY_DERIVATION_HKDF_EXPAND');
    expect(AsymmetricKeyDerivationHkdfExpand.validate('rm -rf /production')).toBe(false);
  });

  it('permits verified safe engineering command', () => {
    const result = AsymmetricKeyDerivationHkdfExpand.inspect('git status && npm run test');
    expect(result.isThreat).toBe(false);
    expect(AsymmetricKeyDerivationHkdfExpand.validate('git status && npm run test')).toBe(true);
  });
});
