import { describe, it, expect } from 'vitest';
import { SudoPrivilegeEscalationGuard } from '../src/ast/sudo_privilege_escalation_guard.js';

describe('SudoPrivilegeEscalationGuard Invariant Suite (#1855)', () => {
  it('correctly intercepts dangerous pattern', () => {
    const result = SudoPrivilegeEscalationGuard.inspect('rm -rf /production');
    expect(result.isThreat).toBe(true);
    expect(result.invariant).toBe('RULE_INVARIANT_SUDO_PRIVILEGE_ESCALATION_GUARD');
    expect(SudoPrivilegeEscalationGuard.validate('rm -rf /production')).toBe(false);
  });

  it('permits verified safe engineering command', () => {
    const result = SudoPrivilegeEscalationGuard.inspect('git status && npm run test');
    expect(result.isThreat).toBe(false);
    expect(SudoPrivilegeEscalationGuard.validate('git status && npm run test')).toBe(true);
  });
});
