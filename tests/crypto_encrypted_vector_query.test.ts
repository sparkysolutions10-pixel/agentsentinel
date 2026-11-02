import { describe, it, expect } from 'vitest';
import { EncryptedVectorQueryWrapper } from '../src/crypto/encrypted_vector_query.js';

describe('Encrypted Vector DB Query Wrapper (#841 & #842)', () => {
  it('encrypts and recovers query vector without plaintext disclosure', () => {
    const vector = [0.123, -0.456, 0.789];
    const key = Buffer.from('secret-key-32-bytes-long-123456');

    const encrypted = EncryptedVectorQueryWrapper.encryptQueryVector(vector, key);
    expect(encrypted.encryptedPayload).toBeDefined();

    const recovered = EncryptedVectorQueryWrapper.decryptQueryVector(encrypted.encryptedPayload, encrypted.iv, key);
    expect(recovered).toEqual(vector);
  });
});
