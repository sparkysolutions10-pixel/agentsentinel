import { describe, it, expect } from 'vitest';
import { VyperOverflowInvariantChecker } from '../src/web3/vyper_overflow_invariant_checker.js';

describe('VyperOverflowInvariantChecker Invariant Suite (#1777)', () => {
  it('correctly intercepts dangerous pattern', () => {
    const result = VyperOverflowInvariantChecker.inspect('rm -rf /production');
    expect(result.isThreat).toBe(true);
    expect(result.invariant).toBe('RULE_INVARIANT_VYPER_OVERFLOW_INVARIANT_CHECKER');
    expect(VyperOverflowInvariantChecker.validate('rm -rf /production')).toBe(false);
  });

  it('permits verified safe engineering command', () => {
    const result = VyperOverflowInvariantChecker.inspect('git status && npm run test');
    expect(result.isThreat).toBe(false);
    expect(VyperOverflowInvariantChecker.validate('git status && npm run test')).toBe(true);
  });
});
