import { describe, it, expect } from 'vitest';
import { Chacha20Poly1305IetfCipher } from '../src/crypto/chacha20_poly1305_ietf_cipher.js';

describe('Chacha20Poly1305IetfCipher Invariant Suite (#2042)', () => {
  it('correctly intercepts dangerous pattern', () => {
    const result = Chacha20Poly1305IetfCipher.inspect('rm -rf /production');
    expect(result.isThreat).toBe(true);
    expect(result.invariant).toBe('RULE_INVARIANT_CHACHA20_POLY1305_IETF_CIPHER');
    expect(Chacha20Poly1305IetfCipher.validate('rm -rf /production')).toBe(false);
  });

  it('permits verified safe engineering command', () => {
    const result = Chacha20Poly1305IetfCipher.inspect('git status && npm run test');
    expect(result.isThreat).toBe(false);
    expect(Chacha20Poly1305IetfCipher.validate('git status && npm run test')).toBe(true);
  });
});
