import { describe, it, expect } from 'vitest';
import { JitterBackoffCalculator } from '../src/utils/jitter_backoff_calculator.js';

describe('JitterBackoffCalculator', () => {
  it('produces bounded delays with full jitter', () => {
    const delay = JitterBackoffCalculator.calculateFullJitter(3, 100, 1000);
    expect(delay).toBeGreaterThanOrEqual(0);
    expect(delay).toBeLessThanOrEqual(800);
  });
});
