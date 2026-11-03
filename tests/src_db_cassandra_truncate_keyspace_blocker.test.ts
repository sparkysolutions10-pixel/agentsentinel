import { describe, it, expect } from 'vitest';
import { CassandraTruncateKeyspaceBlocker } from '../src/db/cassandra_truncate_keyspace_blocker.js';

describe('CassandraTruncateKeyspaceBlocker Invariant Suite (#1922)', () => {
  it('correctly intercepts dangerous pattern', () => {
    const result = CassandraTruncateKeyspaceBlocker.inspect('rm -rf /production');
    expect(result.isThreat).toBe(true);
    expect(result.invariant).toBe('RULE_INVARIANT_CASSANDRA_TRUNCATE_KEYSPACE_BLOCKER');
    expect(CassandraTruncateKeyspaceBlocker.validate('rm -rf /production')).toBe(false);
  });

  it('permits verified safe engineering command', () => {
    const result = CassandraTruncateKeyspaceBlocker.inspect('git status && npm run test');
    expect(result.isThreat).toBe(false);
    expect(CassandraTruncateKeyspaceBlocker.validate('git status && npm run test')).toBe(true);
  });
});
