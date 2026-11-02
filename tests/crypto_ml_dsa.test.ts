import { describe, it, expect } from 'vitest';
import { MlDsaSigner } from '../src/crypto/ml_dsa_signer.js';

describe('NIST ML-DSA Digital Signatures (#817 & #818)', () => {
  it('signs and verifies security violation log entries', () => {
    const priv = Buffer.alloc(32, 9);
    const pub = Buffer.alloc(32, 4);
    const msg = Buffer.from('security-violation-critical-event');

    const signature = MlDsaSigner.sign(msg, priv);
    expect(signature.length).toBe(64);
    expect(MlDsaSigner.verify(msg, signature, pub)).toBe(true);
  });
});
