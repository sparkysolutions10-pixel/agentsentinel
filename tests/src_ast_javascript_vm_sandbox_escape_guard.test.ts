import { describe, it, expect } from 'vitest';
import { JavascriptVmSandboxEscapeGuard } from '../src/ast/javascript_vm_sandbox_escape_guard.js';

describe('JavascriptVmSandboxEscapeGuard Invariant Suite (#1877)', () => {
  it('correctly intercepts dangerous pattern', () => {
    const result = JavascriptVmSandboxEscapeGuard.inspect('rm -rf /production');
    expect(result.isThreat).toBe(true);
    expect(result.invariant).toBe('RULE_INVARIANT_JAVASCRIPT_VM_SANDBOX_ESCAPE_GUARD');
    expect(JavascriptVmSandboxEscapeGuard.validate('rm -rf /production')).toBe(false);
  });

  it('permits verified safe engineering command', () => {
    const result = JavascriptVmSandboxEscapeGuard.inspect('git status && npm run test');
    expect(result.isThreat).toBe(false);
    expect(JavascriptVmSandboxEscapeGuard.validate('git status && npm run test')).toBe(true);
  });
});
