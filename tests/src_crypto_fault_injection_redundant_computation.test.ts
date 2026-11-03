import { describe, it, expect } from 'vitest';
import { FaultInjectionRedundantComputation } from '../src/crypto/fault_injection_redundant_computation.js';

describe('FaultInjectionRedundantComputation Invariant Suite (#2013)', () => {
  it('correctly intercepts dangerous pattern', () => {
    const result = FaultInjectionRedundantComputation.inspect('rm -rf /production');
    expect(result.isThreat).toBe(true);
    expect(result.invariant).toBe('RULE_INVARIANT_FAULT_INJECTION_REDUNDANT_COMPUTATION');
    expect(FaultInjectionRedundantComputation.validate('rm -rf /production')).toBe(false);
  });

  it('permits verified safe engineering command', () => {
    const result = FaultInjectionRedundantComputation.inspect('git status && npm run test');
    expect(result.isThreat).toBe(false);
    expect(FaultInjectionRedundantComputation.validate('git status && npm run test')).toBe(true);
  });
});
