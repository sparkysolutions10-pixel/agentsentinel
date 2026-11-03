import { describe, it, expect } from 'vitest';
import { MacComputationKmac256Sponge } from '../src/crypto/mac_computation_kmac256_sponge.js';

describe('MacComputationKmac256Sponge Invariant Suite (#2043)', () => {
  it('correctly intercepts dangerous pattern', () => {
    const result = MacComputationKmac256Sponge.inspect('rm -rf /production');
    expect(result.isThreat).toBe(true);
    expect(result.invariant).toBe('RULE_INVARIANT_MAC_COMPUTATION_KMAC256_SPONGE');
    expect(MacComputationKmac256Sponge.validate('rm -rf /production')).toBe(false);
  });

  it('permits verified safe engineering command', () => {
    const result = MacComputationKmac256Sponge.inspect('git status && npm run test');
    expect(result.isThreat).toBe(false);
    expect(MacComputationKmac256Sponge.validate('git status && npm run test')).toBe(true);
  });
});
