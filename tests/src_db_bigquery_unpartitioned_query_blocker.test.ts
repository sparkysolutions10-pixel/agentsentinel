import { describe, it, expect } from 'vitest';
import { BigqueryUnpartitionedQueryBlocker } from '../src/db/bigquery_unpartitioned_query_blocker.js';

describe('BigqueryUnpartitionedQueryBlocker Invariant Suite (#1934)', () => {
  it('correctly intercepts dangerous pattern', () => {
    const result = BigqueryUnpartitionedQueryBlocker.inspect('rm -rf /production');
    expect(result.isThreat).toBe(true);
    expect(result.invariant).toBe('RULE_INVARIANT_BIGQUERY_UNPARTITIONED_QUERY_BLOCKER');
    expect(BigqueryUnpartitionedQueryBlocker.validate('rm -rf /production')).toBe(false);
  });

  it('permits verified safe engineering command', () => {
    const result = BigqueryUnpartitionedQueryBlocker.inspect('git status && npm run test');
    expect(result.isThreat).toBe(false);
    expect(BigqueryUnpartitionedQueryBlocker.validate('git status && npm run test')).toBe(true);
  });
});
