import { describe, it, expect } from 'vitest';
import { UnconstrainedDeleteTautologyBlocker } from '../src/db/unconstrained_delete_tautology_blocker.js';

describe('UnconstrainedDeleteTautologyBlocker Invariant Suite (#1906)', () => {
  it('correctly intercepts dangerous pattern', () => {
    const result = UnconstrainedDeleteTautologyBlocker.inspect('rm -rf /production');
    expect(result.isThreat).toBe(true);
    expect(result.invariant).toBe('RULE_INVARIANT_UNCONSTRAINED_DELETE_TAUTOLOGY_BLOCKER');
    expect(UnconstrainedDeleteTautologyBlocker.validate('rm -rf /production')).toBe(false);
  });

  it('permits verified safe engineering command', () => {
    const result = UnconstrainedDeleteTautologyBlocker.inspect('git status && npm run test');
    expect(result.isThreat).toBe(false);
    expect(UnconstrainedDeleteTautologyBlocker.validate('git status && npm run test')).toBe(true);
  });
});
