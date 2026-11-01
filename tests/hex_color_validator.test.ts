import { describe, it, expect } from 'vitest';
import { HexColorValidator } from '../src/utils/hex_color_validator.js';

describe('HexColorValidator', () => {
  it('validates 3, 4, 6, and 8 hex digits', () => {
    expect(HexColorValidator.isValid('#fff')).toBe(true);
    expect(HexColorValidator.isValid('fff')).toBe(true);
    expect(HexColorValidator.isValid('#1a73e8')).toBe(true);
    expect(HexColorValidator.isValid('#1a73e8ff')).toBe(true);
    expect(HexColorValidator.isValid('#xyz')).toBe(false);
    expect(HexColorValidator.isValid('')).toBe(false);
  });

  it('normalizes 3-digit hex to 6-digit lowercase format', () => {
    expect(HexColorValidator.normalize('#ABC')).toBe('#aabbcc');
    expect(HexColorValidator.normalize('1a73e8')).toBe('#1a73e8');
  });
});
