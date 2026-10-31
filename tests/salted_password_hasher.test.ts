import { describe, it, expect } from 'vitest';
import { SaltedPasswordHasher } from '../src/utils/salted_password_hasher.js';

describe('SaltedPasswordHasher', () => {
  it('hashes and successfully verifies passwords', () => {
    const hashed = SaltedPasswordHasher.hash('SuperSecurePass123!');
    expect(hashed.startsWith('$pbkdf2$')).toBe(true);
    expect(SaltedPasswordHasher.verify('SuperSecurePass123!', hashed)).toBe(true);
  });

  it('rejects incorrect passwords and malformed hashes', () => {
    const hashed = SaltedPasswordHasher.hash('SuperSecurePass123!');
    expect(SaltedPasswordHasher.verify('WrongPassword', hashed)).toBe(false);
    expect(SaltedPasswordHasher.verify('SuperSecurePass123!', 'invalid-hash-format')).toBe(false);
  });
});
