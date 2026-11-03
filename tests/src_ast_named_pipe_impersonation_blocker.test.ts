import { describe, it, expect } from 'vitest';
import { NamedPipeImpersonationBlocker } from '../src/ast/named_pipe_impersonation_blocker.js';

describe('NamedPipeImpersonationBlocker Invariant Suite (#1896)', () => {
  it('correctly intercepts dangerous pattern', () => {
    const result = NamedPipeImpersonationBlocker.inspect('rm -rf /production');
    expect(result.isThreat).toBe(true);
    expect(result.invariant).toBe('RULE_INVARIANT_NAMED_PIPE_IMPERSONATION_BLOCKER');
    expect(NamedPipeImpersonationBlocker.validate('rm -rf /production')).toBe(false);
  });

  it('permits verified safe engineering command', () => {
    const result = NamedPipeImpersonationBlocker.inspect('git status && npm run test');
    expect(result.isThreat).toBe(false);
    expect(NamedPipeImpersonationBlocker.validate('git status && npm run test')).toBe(true);
  });
});
