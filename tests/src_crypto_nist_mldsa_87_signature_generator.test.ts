import { describe, it, expect } from 'vitest';
import { NistMldsa87SignatureGenerator } from '../src/crypto/nist_mldsa_87_signature_generator.js';

describe('NistMldsa87SignatureGenerator Invariant Suite (#2005)', () => {
  it('correctly intercepts dangerous pattern', () => {
    const result = NistMldsa87SignatureGenerator.inspect('rm -rf /production');
    expect(result.isThreat).toBe(true);
    expect(result.invariant).toBe('RULE_INVARIANT_NIST_MLDSA_87_SIGNATURE_GENERATOR');
    expect(NistMldsa87SignatureGenerator.validate('rm -rf /production')).toBe(false);
  });

  it('permits verified safe engineering command', () => {
    const result = NistMldsa87SignatureGenerator.inspect('git status && npm run test');
    expect(result.isThreat).toBe(false);
    expect(NistMldsa87SignatureGenerator.validate('git status && npm run test')).toBe(true);
  });
});
