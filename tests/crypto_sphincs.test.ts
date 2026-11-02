import { describe, it, expect } from 'vitest';
import { SphincsSignatureVerifier } from '../src/crypto/sphincs_verifier.js';

describe('SPHINCS+ Signature Verifier (#821 & #822)', () => {
  it('validates genuine stateless hash-based signatures', () => {
    const pub = Buffer.alloc(32, 7);
    const msg = Buffer.from('audit-log-entry');
    const validSig = SphincsSignatureVerifier.createMockSignature(msg, pub);

    expect(SphincsSignatureVerifier.verifySphincsSignature(msg, validSig, pub)).toBe(true);

    const invalidSig = Buffer.alloc(64, 0);
    expect(SphincsSignatureVerifier.verifySphincsSignature(msg, invalidSig, pub)).toBe(false);
  });
});
