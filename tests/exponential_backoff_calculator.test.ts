import { describe, it, expect } from 'vitest';
import { ExponentialBackoffCalculator } from '../src/utils/exponential_backoff_calculator.js';

describe('ExponentialBackoffCalculator', () => {
  it('calculates deterministic exponential delay with no jitter', () => {
    expect(ExponentialBackoffCalculator.calculateDelayMs(0, 100, 10000, 'none')).toBe(100);
    expect(ExponentialBackoffCalculator.calculateDelayMs(1, 100, 10000, 'none')).toBe(200);
    expect(ExponentialBackoffCalculator.calculateDelayMs(2, 100, 10000, 'none')).toBe(400);
    expect(ExponentialBackoffCalculator.calculateDelayMs(3, 100, 10000, 'none')).toBe(800);
  });

  it('caps delay at maxDelayMs', () => {
    expect(ExponentialBackoffCalculator.calculateDelayMs(10, 100, 500, 'none')).toBe(500);
  });

  it('applies full jitter using mock random', () => {
    const delay = ExponentialBackoffCalculator.calculateDelayMs(2, 100, 10000, 'full', () => 0.5);
    expect(delay).toBe(200); // 400 * 0.5 = 200
  });
});
