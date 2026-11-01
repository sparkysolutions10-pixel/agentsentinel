import { describe, it, expect } from 'vitest';
import { ScryptHasher } from '../src/utils/scrypt_hasher.js';

describe('ScryptHasher', () => {
  it('generates consistent scrypt hash', () => {
    const h1 = ScryptHasher.hashHex('password', 'salt-abc', { N: 512 });
    const h2 = ScryptHasher.hashHex('password', 'salt-abc', { N: 512 });
    expect(h1).toBe(h2);
    expect(h1.length).toBe(64);
  });
});
