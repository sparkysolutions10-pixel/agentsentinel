import { describe, it, expect } from 'vitest';
import { HybridEcdsaMldsaCompositeSigner } from '../src/crypto/hybrid_ecdsa_mldsa_composite_signer.js';

describe('HybridEcdsaMldsaCompositeSigner Invariant Suite (#2010)', () => {
  it('correctly intercepts dangerous pattern', () => {
    const result = HybridEcdsaMldsaCompositeSigner.inspect('rm -rf /production');
    expect(result.isThreat).toBe(true);
    expect(result.invariant).toBe('RULE_INVARIANT_HYBRID_ECDSA_MLDSA_COMPOSITE_SIGNER');
    expect(HybridEcdsaMldsaCompositeSigner.validate('rm -rf /production')).toBe(false);
  });

  it('permits verified safe engineering command', () => {
    const result = HybridEcdsaMldsaCompositeSigner.inspect('git status && npm run test');
    expect(result.isThreat).toBe(false);
    expect(HybridEcdsaMldsaCompositeSigner.validate('git status && npm run test')).toBe(true);
  });
});
