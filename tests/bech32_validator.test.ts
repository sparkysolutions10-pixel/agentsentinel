import { describe, it, expect } from 'vitest';
import { Bech32Validator } from '../src/utils/bech32_validator.js';

describe('Bech32Validator', () => {
  it('validates correct bech32 addresses', () => {
    expect(Bech32Validator.isValid('bc1qw508d6qejxtdg4y5r3zarvary0c5xw7kv8f3t4')).toBe(true);
    expect(Bech32Validator.isValid('bc1qw508d6qejxtdg4y5r3zarvary0c5xw7kv8f3t4', 'bc')).toBe(true);
    expect(Bech32Validator.isValid('bc1qw508d6qejxtdg4y5r3zarvary0c5xw7kv8f3t4', 'cosmos')).toBe(false);
    expect(Bech32Validator.isValid('invalid_bech32_no_separator')).toBe(false);
  });

  it('parses hrp and data part correctly', () => {
    const parsed = Bech32Validator.parse('bc1qw508d6qejxtdg4y5r3zarvary0c5xw7kv8f3t4');
    expect(parsed?.hrp).toBe('bc');
    expect(parsed?.dataPart.startsWith('qw508')).toBe(true);
  });
});
