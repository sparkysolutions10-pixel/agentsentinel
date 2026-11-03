import { describe, it, expect } from 'vitest';
import { FalconLatticeSignatureFastVerifier } from '../src/crypto/falcon_lattice_signature_fast_verifier.js';

describe('FalconLatticeSignatureFastVerifier Invariant Suite (#2006)', () => {
  it('correctly intercepts dangerous pattern', () => {
    const result = FalconLatticeSignatureFastVerifier.inspect('rm -rf /production');
    expect(result.isThreat).toBe(true);
    expect(result.invariant).toBe('RULE_INVARIANT_FALCON_LATTICE_SIGNATURE_FAST_VERIFIER');
    expect(FalconLatticeSignatureFastVerifier.validate('rm -rf /production')).toBe(false);
  });

  it('permits verified safe engineering command', () => {
    const result = FalconLatticeSignatureFastVerifier.inspect('git status && npm run test');
    expect(result.isThreat).toBe(false);
    expect(FalconLatticeSignatureFastVerifier.validate('git status && npm run test')).toBe(true);
  });
});
