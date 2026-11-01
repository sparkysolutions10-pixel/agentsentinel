import { describe, it, expect } from 'vitest';
import { HealthScoreCalculator } from '../src/utils/health_score_calculator.js';

describe('HealthScoreCalculator', () => {
  it('computes health score based on metrics', () => {
    expect(HealthScoreCalculator.calculate(0, 200)).toBe(100);
    expect(HealthScoreCalculator.calculate(10, 200)).toBe(70);
    expect(HealthScoreCalculator.calculate(50, 5000)).toBeLessThan(30);
  });
});
