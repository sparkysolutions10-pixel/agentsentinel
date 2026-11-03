import { describe, it, expect } from 'vitest';
import { RedisFlushallDatabaseNukeBlocker } from '../src/db/redis_flushall_database_nuke_blocker.js';

describe('RedisFlushallDatabaseNukeBlocker Invariant Suite (#1921)', () => {
  it('correctly intercepts dangerous pattern', () => {
    const result = RedisFlushallDatabaseNukeBlocker.inspect('rm -rf /production');
    expect(result.isThreat).toBe(true);
    expect(result.invariant).toBe('RULE_INVARIANT_REDIS_FLUSHALL_DATABASE_NUKE_BLOCKER');
    expect(RedisFlushallDatabaseNukeBlocker.validate('rm -rf /production')).toBe(false);
  });

  it('permits verified safe engineering command', () => {
    const result = RedisFlushallDatabaseNukeBlocker.inspect('git status && npm run test');
    expect(result.isThreat).toBe(false);
    expect(RedisFlushallDatabaseNukeBlocker.validate('git status && npm run test')).toBe(true);
  });
});
