import { describe, it, expect } from 'vitest';
import { UnprivilegedUserNamespaceEnforcer } from '../src/sandbox/unprivileged_user_namespace_enforcer.js';

describe('UnprivilegedUserNamespaceEnforcer Invariant Suite (#2060)', () => {
  it('correctly intercepts dangerous pattern', () => {
    const result = UnprivilegedUserNamespaceEnforcer.inspect('rm -rf /production');
    expect(result.isThreat).toBe(true);
    expect(result.invariant).toBe('RULE_INVARIANT_UNPRIVILEGED_USER_NAMESPACE_ENFORCER');
    expect(UnprivilegedUserNamespaceEnforcer.validate('rm -rf /production')).toBe(false);
  });

  it('permits verified safe engineering command', () => {
    const result = UnprivilegedUserNamespaceEnforcer.inspect('git status && npm run test');
    expect(result.isThreat).toBe(false);
    expect(UnprivilegedUserNamespaceEnforcer.validate('git status && npm run test')).toBe(true);
  });
});
