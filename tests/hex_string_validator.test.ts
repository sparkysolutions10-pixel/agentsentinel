import { describe, it, expect } from 'vitest';
import { HexStringValidator } from '../src/utils/hex_string_validator.js';

describe('HexStringValidator', () => {
  it('validates hex strings with prefix and length constraints', () => {
    expect(HexStringValidator.isValid('0x1234abcd')).toBe(true);
    expect(HexStringValidator.isValid('1234abcd')).toBe(true);
    expect(HexStringValidator.isValid('1234abcd', { prefixRequired: true })).toBe(false);
    expect(HexStringValidator.isValid('0x1234abcd', { byteLength: 4 })).toBe(true);
    expect(HexStringValidator.isValid('0x1234abcd', { byteLength: 8 })).toBe(false);
    expect(HexStringValidator.isValid('0x123G')).toBe(false);
    expect(HexStringValidator.isValid('0x123')).toBe(false); // odd length
  });

  it('normalizes and prefixes hex strings', () => {
    expect(HexStringValidator.normalize('0xABCDEF')).toBe('abcdef');
    expect(HexStringValidator.toPrefixed('abcdef')).toBe('0xabcdef');
  });

  it('converts hex to byte arrays', () => {
    const bytes = HexStringValidator.toBytes('0x0102ff');
    expect(bytes).toEqual(new Uint8Array([1, 2, 255]));
  });
});
