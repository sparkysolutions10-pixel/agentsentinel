import { describe, it, expect } from 'vitest';
import { Eip1559BaseFeeSpikeAbsorber } from '../src/web3/eip1559_base_fee_spike_absorber.js';

describe('Eip1559BaseFeeSpikeAbsorber Invariant Suite (#1788)', () => {
  it('correctly intercepts dangerous pattern', () => {
    const result = Eip1559BaseFeeSpikeAbsorber.inspect('rm -rf /production');
    expect(result.isThreat).toBe(true);
    expect(result.invariant).toBe('RULE_INVARIANT_EIP1559_BASE_FEE_SPIKE_ABSORBER');
    expect(Eip1559BaseFeeSpikeAbsorber.validate('rm -rf /production')).toBe(false);
  });

  it('permits verified safe engineering command', () => {
    const result = Eip1559BaseFeeSpikeAbsorber.inspect('git status && npm run test');
    expect(result.isThreat).toBe(false);
    expect(Eip1559BaseFeeSpikeAbsorber.validate('git status && npm run test')).toBe(true);
  });
});
