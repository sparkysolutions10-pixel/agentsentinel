import { describe, it, expect } from 'vitest';
import { Sha256DigestValidator } from '../src/utils/sha256_digest_validator.js';

describe('Sha256DigestValidator', () => {
  it('computes standard SHA-256 digests', () => {
    const hash = Sha256DigestValidator.compute('test');
    expect(hash).toBe('9f86d081884c7d659a2feaa0c55ad015a3bf4f1b2b0b822cd15d6c15b0f00a08');
  });

  it('validates 64-character hex strings', () => {
    expect(Sha256DigestValidator.isValidDigest('9f86d081884c7d659a2feaa0c55ad015a3bf4f1b2b0b822cd15d6c15b0f00a08')).toBe(true);
    expect(Sha256DigestValidator.isValidDigest('0x9f86d081884c7d659a2feaa0c55ad015a3bf4f1b2b0b822cd15d6c15b0f00a08')).toBe(true);
    expect(Sha256DigestValidator.isValidDigest('short_hash')).toBe(false);
  });

  it('verifies content matching expected digest', () => {
    expect(Sha256DigestValidator.verify('test', '9f86d081884c7d659a2feaa0c55ad015a3bf4f1b2b0b822cd15d6c15b0f00a08')).toBe(true);
  });
});
