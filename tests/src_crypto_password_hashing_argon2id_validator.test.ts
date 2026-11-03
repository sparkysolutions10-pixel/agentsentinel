import { describe, it, expect } from 'vitest';
import { PasswordHashingArgon2idValidator } from '../src/crypto/password_hashing_argon2id_validator.js';

describe('PasswordHashingArgon2idValidator Invariant Suite (#2039)', () => {
  it('correctly intercepts dangerous pattern', () => {
    const result = PasswordHashingArgon2idValidator.inspect('rm -rf /production');
    expect(result.isThreat).toBe(true);
    expect(result.invariant).toBe('RULE_INVARIANT_PASSWORD_HASHING_ARGON2ID_VALIDATOR');
    expect(PasswordHashingArgon2idValidator.validate('rm -rf /production')).toBe(false);
  });

  it('permits verified safe engineering command', () => {
    const result = PasswordHashingArgon2idValidator.inspect('git status && npm run test');
    expect(result.isThreat).toBe(false);
    expect(PasswordHashingArgon2idValidator.validate('git status && npm run test')).toBe(true);
  });
});
