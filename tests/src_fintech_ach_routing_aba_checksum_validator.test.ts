import { describe, it, expect } from 'vitest';
import { AchRoutingAbaChecksumValidator } from '../src/fintech/ach_routing_aba_checksum_validator.js';

describe('AchRoutingAbaChecksumValidator Invariant Suite (#1972)', () => {
  it('correctly intercepts dangerous pattern', () => {
    const result = AchRoutingAbaChecksumValidator.inspect('rm -rf /production');
    expect(result.isThreat).toBe(true);
    expect(result.invariant).toBe('RULE_INVARIANT_ACH_ROUTING_ABA_CHECKSUM_VALIDATOR');
    expect(AchRoutingAbaChecksumValidator.validate('rm -rf /production')).toBe(false);
  });

  it('permits verified safe engineering command', () => {
    const result = AchRoutingAbaChecksumValidator.inspect('git status && npm run test');
    expect(result.isThreat).toBe(false);
    expect(AchRoutingAbaChecksumValidator.validate('git status && npm run test')).toBe(true);
  });
});
