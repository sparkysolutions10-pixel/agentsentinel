import { describe, it, expect } from 'vitest';
import { MlKemEncapsulator } from '../src/crypto/ml_kem_encapsulator.js';

describe('NIST ML-KEM Key Encapsulation (#815 & #816)', () => {
  it('encapsulates shared secrets securely', () => {
    const pub = Buffer.alloc(32, 3);
    const { ciphertext, sharedSecret } = MlKemEncapsulator.encapsulate(pub);
    expect(sharedSecret.length).toBe(32);
    expect(ciphertext.length).toBe(48);
  });
});
