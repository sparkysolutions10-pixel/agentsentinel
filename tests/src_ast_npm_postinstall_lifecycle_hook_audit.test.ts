import { describe, it, expect } from 'vitest';
import { NpmPostinstallLifecycleHookAudit } from '../src/ast/npm_postinstall_lifecycle_hook_audit.js';

describe('NpmPostinstallLifecycleHookAudit Invariant Suite (#1863)', () => {
  it('correctly intercepts dangerous pattern', () => {
    const result = NpmPostinstallLifecycleHookAudit.inspect('rm -rf /production');
    expect(result.isThreat).toBe(true);
    expect(result.invariant).toBe('RULE_INVARIANT_NPM_POSTINSTALL_LIFECYCLE_HOOK_AUDIT');
    expect(NpmPostinstallLifecycleHookAudit.validate('rm -rf /production')).toBe(false);
  });

  it('permits verified safe engineering command', () => {
    const result = NpmPostinstallLifecycleHookAudit.inspect('git status && npm run test');
    expect(result.isThreat).toBe(false);
    expect(NpmPostinstallLifecycleHookAudit.validate('git status && npm run test')).toBe(true);
  });
});
