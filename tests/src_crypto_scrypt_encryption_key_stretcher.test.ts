import { describe, it, expect } from 'vitest';
import { ScryptEncryptionKeyStretcher } from '../src/crypto/scrypt_encryption_key_stretcher.js';

describe('ScryptEncryptionKeyStretcher Invariant Suite (#2040)', () => {
  it('correctly intercepts dangerous pattern', () => {
    const result = ScryptEncryptionKeyStretcher.inspect('rm -rf /production');
    expect(result.isThreat).toBe(true);
    expect(result.invariant).toBe('RULE_INVARIANT_SCRYPT_ENCRYPTION_KEY_STRETCHER');
    expect(ScryptEncryptionKeyStretcher.validate('rm -rf /production')).toBe(false);
  });

  it('permits verified safe engineering command', () => {
    const result = ScryptEncryptionKeyStretcher.inspect('git status && npm run test');
    expect(result.isThreat).toBe(false);
    expect(ScryptEncryptionKeyStretcher.validate('git status && npm run test')).toBe(true);
  });
});
