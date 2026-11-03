import { describe, it, expect } from 'vitest';
import { DatabaseReplicaReadLagMonitor } from '../src/db/database_replica_read_lag_monitor.js';

describe('DatabaseReplicaReadLagMonitor Invariant Suite (#1946)', () => {
  it('correctly intercepts dangerous pattern', () => {
    const result = DatabaseReplicaReadLagMonitor.inspect('rm -rf /production');
    expect(result.isThreat).toBe(true);
    expect(result.invariant).toBe('RULE_INVARIANT_DATABASE_REPLICA_READ_LAG_MONITOR');
    expect(DatabaseReplicaReadLagMonitor.validate('rm -rf /production')).toBe(false);
  });

  it('permits verified safe engineering command', () => {
    const result = DatabaseReplicaReadLagMonitor.inspect('git status && npm run test');
    expect(result.isThreat).toBe(false);
    expect(DatabaseReplicaReadLagMonitor.validate('git status && npm run test')).toBe(true);
  });
});
