import { describe, it, expect } from 'vitest';
import { GarbledCircuitsFreeXorOptimization } from '../src/crypto/garbled_circuits_free_xor_optimization.js';

describe('GarbledCircuitsFreeXorOptimization Invariant Suite (#2022)', () => {
  it('correctly intercepts dangerous pattern', () => {
    const result = GarbledCircuitsFreeXorOptimization.inspect('rm -rf /production');
    expect(result.isThreat).toBe(true);
    expect(result.invariant).toBe('RULE_INVARIANT_GARBLED_CIRCUITS_FREE_XOR_OPTIMIZATION');
    expect(GarbledCircuitsFreeXorOptimization.validate('rm -rf /production')).toBe(false);
  });

  it('permits verified safe engineering command', () => {
    const result = GarbledCircuitsFreeXorOptimization.inspect('git status && npm run test');
    expect(result.isThreat).toBe(false);
    expect(GarbledCircuitsFreeXorOptimization.validate('git status && npm run test')).toBe(true);
  });
});
