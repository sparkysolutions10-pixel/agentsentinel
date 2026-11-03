import { describe, it, expect } from 'vitest';
import { MevFrontrunningShield } from '../src/web3/mev_frontrunning_shield.js';

describe('MevFrontrunningShield Invariant Suite (#1768)', () => {
  it('correctly intercepts dangerous pattern', () => {
    const result = MevFrontrunningShield.inspect('rm -rf /production');
    expect(result.isThreat).toBe(true);
    expect(result.invariant).toBe('RULE_INVARIANT_MEV_FRONTRUNNING_SHIELD');
    expect(MevFrontrunningShield.validate('rm -rf /production')).toBe(false);
  });

  it('permits verified safe engineering command', () => {
    const result = MevFrontrunningShield.inspect('git status && npm run test');
    expect(result.isThreat).toBe(false);
    expect(MevFrontrunningShield.validate('git status && npm run test')).toBe(true);
  });
});
