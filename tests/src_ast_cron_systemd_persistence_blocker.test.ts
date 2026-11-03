import { describe, it, expect } from 'vitest';
import { CronSystemdPersistenceBlocker } from '../src/ast/cron_systemd_persistence_blocker.js';

describe('CronSystemdPersistenceBlocker Invariant Suite (#1859)', () => {
  it('correctly intercepts dangerous pattern', () => {
    const result = CronSystemdPersistenceBlocker.inspect('rm -rf /production');
    expect(result.isThreat).toBe(true);
    expect(result.invariant).toBe('RULE_INVARIANT_CRON_SYSTEMD_PERSISTENCE_BLOCKER');
    expect(CronSystemdPersistenceBlocker.validate('rm -rf /production')).toBe(false);
  });

  it('permits verified safe engineering command', () => {
    const result = CronSystemdPersistenceBlocker.inspect('git status && npm run test');
    expect(result.isThreat).toBe(false);
    expect(CronSystemdPersistenceBlocker.validate('git status && npm run test')).toBe(true);
  });
});
