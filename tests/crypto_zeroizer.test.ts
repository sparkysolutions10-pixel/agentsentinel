import { describe, it, expect } from 'vitest';
import { KeyMemoryZeroizer } from '../src/crypto/zeroizer.js';

describe('Key Memory Zeroization (#871 & #872)', () => {
  it('wipes buffer memory cleanly with zeros', () => {
    const secret = Buffer.from('super-secret-private-key-1234');
    expect(secret.toString()).toBe('super-secret-private-key-1234');

    KeyMemoryZeroizer.zeroize(secret);
    for (let i = 0; i < secret.length; i++) {
      expect(secret[i]).toBe(0);
    }
  });
});
