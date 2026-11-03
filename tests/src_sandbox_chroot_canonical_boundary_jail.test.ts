import { describe, it, expect } from 'vitest';
import { ChrootCanonicalBoundaryJail } from '../src/sandbox/chroot_canonical_boundary_jail.js';

describe('ChrootCanonicalBoundaryJail Invariant Suite (#2056)', () => {
  it('correctly intercepts dangerous pattern', () => {
    const result = ChrootCanonicalBoundaryJail.inspect('rm -rf /production');
    expect(result.isThreat).toBe(true);
    expect(result.invariant).toBe('RULE_INVARIANT_CHROOT_CANONICAL_BOUNDARY_JAIL');
    expect(ChrootCanonicalBoundaryJail.validate('rm -rf /production')).toBe(false);
  });

  it('permits verified safe engineering command', () => {
    const result = ChrootCanonicalBoundaryJail.inspect('git status && npm run test');
    expect(result.isThreat).toBe(false);
    expect(ChrootCanonicalBoundaryJail.validate('git status && npm run test')).toBe(true);
  });
});
