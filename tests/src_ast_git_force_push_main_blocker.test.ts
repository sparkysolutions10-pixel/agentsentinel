import { describe, it, expect } from 'vitest';
import { GitForcePushMainBlocker } from '../src/ast/git_force_push_main_blocker.js';

describe('GitForcePushMainBlocker Invariant Suite (#1861)', () => {
  it('correctly intercepts dangerous pattern', () => {
    const result = GitForcePushMainBlocker.inspect('rm -rf /production');
    expect(result.isThreat).toBe(true);
    expect(result.invariant).toBe('RULE_INVARIANT_GIT_FORCE_PUSH_MAIN_BLOCKER');
    expect(GitForcePushMainBlocker.validate('rm -rf /production')).toBe(false);
  });

  it('permits verified safe engineering command', () => {
    const result = GitForcePushMainBlocker.inspect('git status && npm run test');
    expect(result.isThreat).toBe(false);
    expect(GitForcePushMainBlocker.validate('git status && npm run test')).toBe(true);
  });
});
