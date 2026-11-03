import { describe, it, expect } from 'vitest';
import { UnconstrainedUpdateWithoutWhereGuard } from '../src/db/unconstrained_update_without_where_guard.js';

describe('UnconstrainedUpdateWithoutWhereGuard Invariant Suite (#1907)', () => {
  it('correctly intercepts dangerous pattern', () => {
    const result = UnconstrainedUpdateWithoutWhereGuard.inspect('rm -rf /production');
    expect(result.isThreat).toBe(true);
    expect(result.invariant).toBe('RULE_INVARIANT_UNCONSTRAINED_UPDATE_WITHOUT_WHERE_GUARD');
    expect(UnconstrainedUpdateWithoutWhereGuard.validate('rm -rf /production')).toBe(false);
  });

  it('permits verified safe engineering command', () => {
    const result = UnconstrainedUpdateWithoutWhereGuard.inspect('git status && npm run test');
    expect(result.isThreat).toBe(false);
    expect(UnconstrainedUpdateWithoutWhereGuard.validate('git status && npm run test')).toBe(true);
  });
});
