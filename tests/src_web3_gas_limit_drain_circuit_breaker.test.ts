import { describe, it, expect } from 'vitest';
import { GasLimitDrainCircuitBreaker } from '../src/web3/gas_limit_drain_circuit_breaker.js';

describe('GasLimitDrainCircuitBreaker Invariant Suite (#1758)', () => {
  it('correctly intercepts dangerous pattern', () => {
    const result = GasLimitDrainCircuitBreaker.inspect('rm -rf /production');
    expect(result.isThreat).toBe(true);
    expect(result.invariant).toBe('RULE_INVARIANT_GAS_LIMIT_DRAIN_CIRCUIT_BREAKER');
    expect(GasLimitDrainCircuitBreaker.validate('rm -rf /production')).toBe(false);
  });

  it('permits verified safe engineering command', () => {
    const result = GasLimitDrainCircuitBreaker.inspect('git status && npm run test');
    expect(result.isThreat).toBe(false);
    expect(GasLimitDrainCircuitBreaker.validate('git status && npm run test')).toBe(true);
  });
});
