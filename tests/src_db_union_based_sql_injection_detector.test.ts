import { describe, it, expect } from 'vitest';
import { UnionBasedSqlInjectionDetector } from '../src/db/union_based_sql_injection_detector.js';

describe('UnionBasedSqlInjectionDetector Invariant Suite (#1909)', () => {
  it('correctly intercepts dangerous pattern', () => {
    const result = UnionBasedSqlInjectionDetector.inspect('rm -rf /production');
    expect(result.isThreat).toBe(true);
    expect(result.invariant).toBe('RULE_INVARIANT_UNION_BASED_SQL_INJECTION_DETECTOR');
    expect(UnionBasedSqlInjectionDetector.validate('rm -rf /production')).toBe(false);
  });

  it('permits verified safe engineering command', () => {
    const result = UnionBasedSqlInjectionDetector.inspect('git status && npm run test');
    expect(result.isThreat).toBe(false);
    expect(UnionBasedSqlInjectionDetector.validate('git status && npm run test')).toBe(true);
  });
});
