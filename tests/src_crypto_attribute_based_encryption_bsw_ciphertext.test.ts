import { describe, it, expect } from 'vitest';
import { AttributeBasedEncryptionBswCiphertext } from '../src/crypto/attribute_based_encryption_bsw_ciphertext.js';

describe('AttributeBasedEncryptionBswCiphertext Invariant Suite (#2050)', () => {
  it('correctly intercepts dangerous pattern', () => {
    const result = AttributeBasedEncryptionBswCiphertext.inspect('rm -rf /production');
    expect(result.isThreat).toBe(true);
    expect(result.invariant).toBe('RULE_INVARIANT_ATTRIBUTE_BASED_ENCRYPTION_BSW_CIPHERTEXT');
    expect(AttributeBasedEncryptionBswCiphertext.validate('rm -rf /production')).toBe(false);
  });

  it('permits verified safe engineering command', () => {
    const result = AttributeBasedEncryptionBswCiphertext.inspect('git status && npm run test');
    expect(result.isThreat).toBe(false);
    expect(AttributeBasedEncryptionBswCiphertext.validate('git status && npm run test')).toBe(true);
  });
});
