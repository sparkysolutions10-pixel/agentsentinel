import { describe, it, expect } from 'vitest';
import { PgvectorIndexCorruptionMonitor } from '../src/db/pgvector_index_corruption_monitor.js';

describe('PgvectorIndexCorruptionMonitor Invariant Suite (#1910)', () => {
  it('correctly intercepts dangerous pattern', () => {
    const result = PgvectorIndexCorruptionMonitor.inspect('rm -rf /production');
    expect(result.isThreat).toBe(true);
    expect(result.invariant).toBe('RULE_INVARIANT_PGVECTOR_INDEX_CORRUPTION_MONITOR');
    expect(PgvectorIndexCorruptionMonitor.validate('rm -rf /production')).toBe(false);
  });

  it('permits verified safe engineering command', () => {
    const result = PgvectorIndexCorruptionMonitor.inspect('git status && npm run test');
    expect(result.isThreat).toBe(false);
    expect(PgvectorIndexCorruptionMonitor.validate('git status && npm run test')).toBe(true);
  });
});
