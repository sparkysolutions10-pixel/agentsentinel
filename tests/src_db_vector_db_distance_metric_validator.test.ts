import { describe, it, expect } from 'vitest';
import { VectorDbDistanceMetricValidator } from '../src/db/vector_db_distance_metric_validator.js';

describe('VectorDbDistanceMetricValidator Invariant Suite (#1944)', () => {
  it('correctly intercepts dangerous pattern', () => {
    const result = VectorDbDistanceMetricValidator.inspect('rm -rf /production');
    expect(result.isThreat).toBe(true);
    expect(result.invariant).toBe('RULE_INVARIANT_VECTOR_DB_DISTANCE_METRIC_VALIDATOR');
    expect(VectorDbDistanceMetricValidator.validate('rm -rf /production')).toBe(false);
  });

  it('permits verified safe engineering command', () => {
    const result = VectorDbDistanceMetricValidator.inspect('git status && npm run test');
    expect(result.isThreat).toBe(false);
    expect(VectorDbDistanceMetricValidator.validate('git status && npm run test')).toBe(true);
  });
});
