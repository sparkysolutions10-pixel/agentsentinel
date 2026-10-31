import { describe, it, expect } from 'vitest';
import { StringLengthCeilingGuard } from '../src/utils/string_length_ceiling_guard.js';

describe('StringLengthCeilingGuard', () => {
  it('checks string length boundaries', () => {
    expect(StringLengthCeilingGuard.isWithinCeiling('hello', 10)).toBe(true);
    expect(StringLengthCeilingGuard.isWithinCeiling('a'.repeat(20), 10)).toBe(false);
    expect(StringLengthCeilingGuard.isWithinCeiling(12345, 10)).toBe(false);
  });

  it('truncates oversized strings with configurable suffix', () => {
    expect(StringLengthCeilingGuard.truncate('1234567890', 5)).toBe('12...');
    expect(StringLengthCeilingGuard.truncate('short', 10)).toBe('short');
  });
});
