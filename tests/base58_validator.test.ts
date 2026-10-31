import { describe, it, expect } from 'vitest';
import { Base58Validator } from '../src/utils/base58_validator.js';

describe('Base58Validator', () => {
  it('validates base58 characters correctly', () => {
    expect(Base58Validator.isValid('1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa')).toBe(true);
    expect(Base58Validator.isValid('0OIl')).toBe(false); // 0, O, I, l are invalid in Base58
  });

  it('encodes and decodes bytes symmetrically', () => {
    const input = new Uint8Array([0, 0, 1, 2, 3, 255]);
    const encoded = Base58Validator.encode(input);
    const decoded = Base58Validator.decode(encoded);
    expect(decoded).toEqual(input);
  });
});
