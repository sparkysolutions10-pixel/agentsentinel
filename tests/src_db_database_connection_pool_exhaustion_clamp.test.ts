import { describe, it, expect } from 'vitest';
import { DatabaseConnectionPoolExhaustionClamp } from '../src/db/database_connection_pool_exhaustion_clamp.js';

describe('DatabaseConnectionPoolExhaustionClamp Invariant Suite (#1924)', () => {
  it('correctly intercepts dangerous pattern', () => {
    const result = DatabaseConnectionPoolExhaustionClamp.inspect('rm -rf /production');
    expect(result.isThreat).toBe(true);
    expect(result.invariant).toBe('RULE_INVARIANT_DATABASE_CONNECTION_POOL_EXHAUSTION_CLAMP');
    expect(DatabaseConnectionPoolExhaustionClamp.validate('rm -rf /production')).toBe(false);
  });

  it('permits verified safe engineering command', () => {
    const result = DatabaseConnectionPoolExhaustionClamp.inspect('git status && npm run test');
    expect(result.isThreat).toBe(false);
    expect(DatabaseConnectionPoolExhaustionClamp.validate('git status && npm run test')).toBe(true);
  });
});
