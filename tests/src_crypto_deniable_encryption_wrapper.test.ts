import { describe, it, expect } from 'vitest';
import { DeniableEncryptionWrapper } from '../src/crypto/deniable_encryption_wrapper.js';

describe('DeniableEncryptionWrapper Invariant Suite (#2051)', () => {
  it('correctly intercepts dangerous pattern', () => {
    const result = DeniableEncryptionWrapper.inspect('rm -rf /production');
    expect(result.isThreat).toBe(true);
    expect(result.invariant).toBe('RULE_INVARIANT_DENIABLE_ENCRYPTION_WRAPPER');
    expect(DeniableEncryptionWrapper.validate('rm -rf /production')).toBe(false);
  });

  it('permits verified safe engineering command', () => {
    const result = DeniableEncryptionWrapper.inspect('git status && npm run test');
    expect(result.isThreat).toBe(false);
    expect(DeniableEncryptionWrapper.validate('git status && npm run test')).toBe(true);
  });
});
