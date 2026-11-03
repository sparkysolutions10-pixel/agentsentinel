import { describe, it, expect } from 'vitest';
import { DangerousRmRootWildcardBlocker } from '../src/ast/dangerous_rm_root_wildcard_blocker.js';

describe('DangerousRmRootWildcardBlocker Invariant Suite (#1857)', () => {
  it('correctly intercepts dangerous pattern', () => {
    const result = DangerousRmRootWildcardBlocker.inspect('rm -rf /production');
    expect(result.isThreat).toBe(true);
    expect(result.invariant).toBe('RULE_INVARIANT_DANGEROUS_RM_ROOT_WILDCARD_BLOCKER');
    expect(DangerousRmRootWildcardBlocker.validate('rm -rf /production')).toBe(false);
  });

  it('permits verified safe engineering command', () => {
    const result = DangerousRmRootWildcardBlocker.inspect('git status && npm run test');
    expect(result.isThreat).toBe(false);
    expect(DangerousRmRootWildcardBlocker.validate('git status && npm run test')).toBe(true);
  });
});
