import { describe, it, expect } from 'vitest';
import { SlowQueryQuadraticJoinInterceptor } from '../src/db/slow_query_quadratic_join_interceptor.js';

describe('SlowQueryQuadraticJoinInterceptor Invariant Suite (#1925)', () => {
  it('correctly intercepts dangerous pattern', () => {
    const result = SlowQueryQuadraticJoinInterceptor.inspect('rm -rf /production');
    expect(result.isThreat).toBe(true);
    expect(result.invariant).toBe('RULE_INVARIANT_SLOW_QUERY_QUADRATIC_JOIN_INTERCEPTOR');
    expect(SlowQueryQuadraticJoinInterceptor.validate('rm -rf /production')).toBe(false);
  });

  it('permits verified safe engineering command', () => {
    const result = SlowQueryQuadraticJoinInterceptor.inspect('git status && npm run test');
    expect(result.isThreat).toBe(false);
    expect(SlowQueryQuadraticJoinInterceptor.validate('git status && npm run test')).toBe(true);
  });
});
