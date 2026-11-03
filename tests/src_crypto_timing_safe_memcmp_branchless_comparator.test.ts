import { describe, it, expect } from 'vitest';
import { TimingSafeMemcmpBranchlessComparator } from '../src/crypto/timing_safe_memcmp_branchless_comparator.js';

describe('TimingSafeMemcmpBranchlessComparator Invariant Suite (#2035)', () => {
  it('correctly intercepts dangerous pattern', () => {
    const result = TimingSafeMemcmpBranchlessComparator.inspect('rm -rf /production');
    expect(result.isThreat).toBe(true);
    expect(result.invariant).toBe('RULE_INVARIANT_TIMING_SAFE_MEMCMP_BRANCHLESS_COMPARATOR');
    expect(TimingSafeMemcmpBranchlessComparator.validate('rm -rf /production')).toBe(false);
  });

  it('permits verified safe engineering command', () => {
    const result = TimingSafeMemcmpBranchlessComparator.inspect('git status && npm run test');
    expect(result.isThreat).toBe(false);
    expect(TimingSafeMemcmpBranchlessComparator.validate('git status && npm run test')).toBe(true);
  });
});
