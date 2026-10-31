import { describe, it, expect } from 'vitest';
import { Keccak256Validator } from '../src/utils/keccak256_validator.js';

describe('Keccak256Validator', () => {
  const validHash = '0xc5d2460186f7233c927e7db2dcc703c0e500b653ca82273b7bfad8045d85a470';

  it('validates 32-byte EVM hash formats', () => {
    expect(Keccak256Validator.isValidHash(validHash)).toBe(true);
    expect(Keccak256Validator.isValidHash(validHash.slice(2))).toBe(true); // without prefix
    expect(Keccak256Validator.isValidHash('0x1234')).toBe(false); // too short
  });

  it('normalizes hashes to 0x-prefixed lowercase', () => {
    expect(Keccak256Validator.normalize(validHash.toUpperCase())).toBe(validHash.toLowerCase());
  });

  it('compares hashes securely ignoring casing', () => {
    expect(Keccak256Validator.areEqual(validHash, validHash.toUpperCase())).toBe(true);
  });
});
