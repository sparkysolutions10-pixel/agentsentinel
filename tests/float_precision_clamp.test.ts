import { describe, it, expect } from 'vitest';
import { FloatPrecisionClamp } from '../src/utils/float_precision_clamp.js';

describe('FloatPrecisionClamp', () => {
  it('rounds numbers to designated decimal places', () => {
    expect(FloatPrecisionClamp.round(12.3456, 2)).toBe(12.35);
    expect(FloatPrecisionClamp.round(10.1, 2)).toBe(10.1);
  });

  it('checks precision boundaries', () => {
    expect(FloatPrecisionClamp.hasValidPrecision(12.34, 2)).toBe(true);
    expect(FloatPrecisionClamp.hasValidPrecision(12.345, 2)).toBe(false);
    expect(FloatPrecisionClamp.hasValidPrecision(100, 2)).toBe(true);
  });
});
