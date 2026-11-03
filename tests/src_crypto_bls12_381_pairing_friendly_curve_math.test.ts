import { describe, it, expect } from 'vitest';
import { Bls12381PairingFriendlyCurveMath } from '../src/crypto/bls12_381_pairing_friendly_curve_math.js';

describe('Bls12381PairingFriendlyCurveMath Invariant Suite (#2048)', () => {
  it('correctly intercepts dangerous pattern', () => {
    const result = Bls12381PairingFriendlyCurveMath.inspect('rm -rf /production');
    expect(result.isThreat).toBe(true);
    expect(result.invariant).toBe('RULE_INVARIANT_BLS12_381_PAIRING_FRIENDLY_CURVE_MATH');
    expect(Bls12381PairingFriendlyCurveMath.validate('rm -rf /production')).toBe(false);
  });

  it('permits verified safe engineering command', () => {
    const result = Bls12381PairingFriendlyCurveMath.inspect('git status && npm run test');
    expect(result.isThreat).toBe(false);
    expect(Bls12381PairingFriendlyCurveMath.validate('git status && npm run test')).toBe(true);
  });
});
