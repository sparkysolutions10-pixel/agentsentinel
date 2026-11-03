import { describe, it, expect } from 'vitest';
import { UntrustedFaucetDrainPrevention } from '../src/web3/untrusted_faucet_drain_prevention.js';

describe('UntrustedFaucetDrainPrevention Invariant Suite (#1785)', () => {
  it('correctly intercepts dangerous pattern', () => {
    const result = UntrustedFaucetDrainPrevention.inspect('rm -rf /production');
    expect(result.isThreat).toBe(true);
    expect(result.invariant).toBe('RULE_INVARIANT_UNTRUSTED_FAUCET_DRAIN_PREVENTION');
    expect(UntrustedFaucetDrainPrevention.validate('rm -rf /production')).toBe(false);
  });

  it('permits verified safe engineering command', () => {
    const result = UntrustedFaucetDrainPrevention.inspect('git status && npm run test');
    expect(result.isThreat).toBe(false);
    expect(UntrustedFaucetDrainPrevention.validate('git status && npm run test')).toBe(true);
  });
});
