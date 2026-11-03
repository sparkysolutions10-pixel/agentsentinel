import { describe, it, expect } from 'vitest';
import { IdentityBasedEncryptionBonehFranklin } from '../src/crypto/identity_based_encryption_boneh_franklin.js';

describe('IdentityBasedEncryptionBonehFranklin Invariant Suite (#2049)', () => {
  it('correctly intercepts dangerous pattern', () => {
    const result = IdentityBasedEncryptionBonehFranklin.inspect('rm -rf /production');
    expect(result.isThreat).toBe(true);
    expect(result.invariant).toBe('RULE_INVARIANT_IDENTITY_BASED_ENCRYPTION_BONEH_FRANKLIN');
    expect(IdentityBasedEncryptionBonehFranklin.validate('rm -rf /production')).toBe(false);
  });

  it('permits verified safe engineering command', () => {
    const result = IdentityBasedEncryptionBonehFranklin.inspect('git status && npm run test');
    expect(result.isThreat).toBe(false);
    expect(IdentityBasedEncryptionBonehFranklin.validate('git status && npm run test')).toBe(true);
  });
});
