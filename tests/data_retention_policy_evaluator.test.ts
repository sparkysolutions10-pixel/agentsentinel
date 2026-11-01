import { describe, it, expect } from 'vitest';
import { DataRetentionPolicyEvaluator } from '../src/utils/data_retention_policy_evaluator.js';

describe('DataRetentionPolicyEvaluator', () => {
  it('detects records older than retention limit', () => {
    const oneDayMs = 24 * 60 * 60 * 1000;
    const now = 1000000000;
    expect(DataRetentionPolicyEvaluator.isExpired(now - (31 * oneDayMs), 30, now)).toBe(true);
    expect(DataRetentionPolicyEvaluator.isExpired(now - (10 * oneDayMs), 30, now)).toBe(false);
  });
});
