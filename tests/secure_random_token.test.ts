import { describe, it, expect } from 'vitest';
import { SecureRandomToken } from '../src/utils/secure_random_token.js';

describe('SecureRandomToken', () => {
  it('generates random tokens of specified length', () => {
    const token = SecureRandomToken.generate(48);
    expect(token.length).toBe(48);
    expect(typeof token).toBe('string');
  });

  it('generates hex nonces with correct byte length representation', () => {
    const hex = SecureRandomToken.generateHex(16);
    expect(hex.length).toBe(32);
    expect(/^[0-9a-f]{32}$/.test(hex)).toBe(true);
  });

  it('generates valid UUID v4 format', () => {
    const uuid = SecureRandomToken.generateUuid();
    expect(/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(uuid)).toBe(true);
  });
});
