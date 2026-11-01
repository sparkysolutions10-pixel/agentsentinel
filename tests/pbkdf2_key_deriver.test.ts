import { describe, it, expect } from 'vitest';
import { Pbkdf2KeyDeriver } from '../src/utils/pbkdf2_key_deriver.js';

describe('Pbkdf2KeyDeriver', () => {
  it('derives consistent 32-byte keys for same input', () => {
    const k1 = Pbkdf2KeyDeriver.deriveHexKey('pass123', 'salt456', { iterations: 1000 });
    const k2 = Pbkdf2KeyDeriver.deriveHexKey('pass123', 'salt456', { iterations: 1000 });
    expect(k1).toBe(k2);
    expect(k1.length).toBe(64); // 32 bytes hex
  });

  it('produces different keys for different salts', () => {
    const k1 = Pbkdf2KeyDeriver.deriveHexKey('pass123', 'saltA', { iterations: 1000 });
    const k2 = Pbkdf2KeyDeriver.deriveHexKey('pass123', 'saltB', { iterations: 1000 });
    expect(k1).not.toBe(k2);
  });
});
