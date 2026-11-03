import { describe, it, expect } from 'vitest';
import { ObliviousRamPathOramClient } from '../src/crypto/oblivious_ram_path_oram_client.js';

describe('ObliviousRamPathOramClient Invariant Suite (#2024)', () => {
  it('correctly intercepts dangerous pattern', () => {
    const result = ObliviousRamPathOramClient.inspect('rm -rf /production');
    expect(result.isThreat).toBe(true);
    expect(result.invariant).toBe('RULE_INVARIANT_OBLIVIOUS_RAM_PATH_ORAM_CLIENT');
    expect(ObliviousRamPathOramClient.validate('rm -rf /production')).toBe(false);
  });

  it('permits verified safe engineering command', () => {
    const result = ObliviousRamPathOramClient.inspect('git status && npm run test');
    expect(result.isThreat).toBe(false);
    expect(ObliviousRamPathOramClient.validate('git status && npm run test')).toBe(true);
  });
});
