import { describe, it, expect } from 'vitest';
import { HkdfSessionDeriver } from '../src/crypto/hkdf_session.js';

describe('HKDF Key Derivation for Sessions (#865 & #866)', () => {
  it('derives independent cryptographically isolated keys for distinct sessions', () => {
    const master = Buffer.from('master-seed-secret-bytes-123456');
    const salt = Buffer.from('random-session-salt-999');

    const key1 = HkdfSessionDeriver.deriveKey(master, salt, 'session-agent-alpha', 32);
    const key2 = HkdfSessionDeriver.deriveKey(master, salt, 'session-agent-beta', 32);

    expect(key1.length).toBe(32);
    expect(key2.length).toBe(32);
    expect(key1.equals(key2)).toBe(false);
  });
});
