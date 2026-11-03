import { describe, it, expect } from 'vitest';
import { SystemRebootShutdownBlocker } from '../src/ast/system_reboot_shutdown_blocker.js';

describe('SystemRebootShutdownBlocker Invariant Suite (#1870)', () => {
  it('correctly intercepts dangerous pattern', () => {
    const result = SystemRebootShutdownBlocker.inspect('rm -rf /production');
    expect(result.isThreat).toBe(true);
    expect(result.invariant).toBe('RULE_INVARIANT_SYSTEM_REBOOT_SHUTDOWN_BLOCKER');
    expect(SystemRebootShutdownBlocker.validate('rm -rf /production')).toBe(false);
  });

  it('permits verified safe engineering command', () => {
    const result = SystemRebootShutdownBlocker.inspect('git status && npm run test');
    expect(result.isThreat).toBe(false);
    expect(SystemRebootShutdownBlocker.validate('git status && npm run test')).toBe(true);
  });
});
