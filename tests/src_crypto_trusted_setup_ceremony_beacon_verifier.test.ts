import { describe, it, expect } from 'vitest';
import { TrustedSetupCeremonyBeaconVerifier } from '../src/crypto/trusted_setup_ceremony_beacon_verifier.js';

describe('TrustedSetupCeremonyBeaconVerifier Invariant Suite (#2018)', () => {
  it('correctly intercepts dangerous pattern', () => {
    const result = TrustedSetupCeremonyBeaconVerifier.inspect('rm -rf /production');
    expect(result.isThreat).toBe(true);
    expect(result.invariant).toBe('RULE_INVARIANT_TRUSTED_SETUP_CEREMONY_BEACON_VERIFIER');
    expect(TrustedSetupCeremonyBeaconVerifier.validate('rm -rf /production')).toBe(false);
  });

  it('permits verified safe engineering command', () => {
    const result = TrustedSetupCeremonyBeaconVerifier.inspect('git status && npm run test');
    expect(result.isThreat).toBe(false);
    expect(TrustedSetupCeremonyBeaconVerifier.validate('git status && npm run test')).toBe(true);
  });
});
