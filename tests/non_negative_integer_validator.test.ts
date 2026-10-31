import { describe, it, expect } from 'vitest';
import { NonNegativeIntegerValidator } from '../src/utils/non_negative_integer_validator.js';

describe('NonNegativeIntegerValidator', () => {
  it('validates non-negative integers accurately', () => {
    expect(NonNegativeIntegerValidator.isValid(0)).toBe(true);
    expect(NonNegativeIntegerValidator.isValid(42)).toBe(true);
    expect(NonNegativeIntegerValidator.isValid(100, 100)).toBe(true);
    expect(NonNegativeIntegerValidator.isValid(101, 100)).toBe(false);
    expect(NonNegativeIntegerValidator.isValid(-1)).toBe(false);
    expect(NonNegativeIntegerValidator.isValid(3.14)).toBe(false);
    expect(NonNegativeIntegerValidator.isValid('10')).toBe(false);
  });

  it('clamps values cleanly to limits', () => {
    expect(NonNegativeIntegerValidator.clamp(150, 100)).toBe(100);
    expect(NonNegativeIntegerValidator.clamp(-5, 100)).toBe(0);
    expect(NonNegativeIntegerValidator.clamp(42.9, 100)).toBe(42);
  });
});
