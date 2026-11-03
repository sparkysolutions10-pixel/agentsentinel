import { describe, it, expect } from 'vitest';
import { DatabaseTransactionIdleTimeoutReaper } from '../src/db/database_transaction_idle_timeout_reaper.js';

describe('DatabaseTransactionIdleTimeoutReaper Invariant Suite (#1926)', () => {
  it('correctly intercepts dangerous pattern', () => {
    const result = DatabaseTransactionIdleTimeoutReaper.inspect('rm -rf /production');
    expect(result.isThreat).toBe(true);
    expect(result.invariant).toBe('RULE_INVARIANT_DATABASE_TRANSACTION_IDLE_TIMEOUT_REAPER');
    expect(DatabaseTransactionIdleTimeoutReaper.validate('rm -rf /production')).toBe(false);
  });

  it('permits verified safe engineering command', () => {
    const result = DatabaseTransactionIdleTimeoutReaper.inspect('git status && npm run test');
    expect(result.isThreat).toBe(false);
    expect(DatabaseTransactionIdleTimeoutReaper.validate('git status && npm run test')).toBe(true);
  });
});
