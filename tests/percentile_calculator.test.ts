import { describe, it, expect } from 'vitest';
import { PercentileCalculator } from '../src/utils/percentile_calculator.js';

describe('PercentileCalculator', () => {
  it('computes exact median and p90', () => {
    const data = [10, 20, 30, 40, 50, 60, 70, 80, 90, 100];
    expect(PercentileCalculator.calculate(data, 50)).toBe(55);
    expect(PercentileCalculator.calculate(data, 90)).toBe(91);
    expect(PercentileCalculator.calculate([], 50)).toBe(0);
  });
});
