import { describe, it, expect } from 'vitest';
import { Crc32Calculator } from '../src/utils/crc32_checksum.js';

describe('Crc32Calculator', () => {
  it('computes correct standard CRC32 values', () => {
    // Standard test vectors
    expect(Crc32Calculator.calculateHex('123456789')).toBe('cbf43926');
    expect(Crc32Calculator.calculateHex('hello world')).toBe('0d4a1185');
  });

  it('verifies data matching expected CRC values', () => {
    expect(Crc32Calculator.verify('hello world', '0d4a1185')).toBe(true);
    expect(Crc32Calculator.verify('hello world', '12345678')).toBe(false);
  });
});
