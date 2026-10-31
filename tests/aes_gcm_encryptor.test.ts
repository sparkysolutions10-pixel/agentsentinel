import { describe, it, expect } from 'vitest';
import { AesGcmEncryptor } from '../src/utils/aes_gcm_encryptor.js';
import crypto from 'node:crypto';

describe('AesGcmEncryptor', () => {
  const key = crypto.randomBytes(32);
  const secretData = 'super_sensitive_api_secret_key_123';

  it('encrypts and decrypts symmetrically with AEAD integrity', () => {
    const encrypted = AesGcmEncryptor.encrypt(secretData, key);
    expect(encrypted.ciphertext).toBeDefined();
    expect(encrypted.iv.length).toBe(24); // 12 bytes hex
    expect(encrypted.tag.length).toBe(32); // 16 bytes hex

    const decrypted = AesGcmEncryptor.decrypt(encrypted, key);
    expect(decrypted).toBe(secretData);
  });

  it('fails decryption on modified ciphertext or tampered tag', () => {
    const encrypted = AesGcmEncryptor.encrypt(secretData, key);
    const tampered = { ...encrypted, tag: '0'.repeat(32) };
    expect(() => AesGcmEncryptor.decrypt(tampered, key)).toThrow();
  });
});
