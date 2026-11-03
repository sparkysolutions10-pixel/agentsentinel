import { describe, it, expect } from 'vitest';
import { FraudVelocityCardTestingBlocker } from '../src/fintech/fraud_velocity_card_testing_blocker.js';

describe('FraudVelocityCardTestingBlocker Invariant Suite (#1977)', () => {
  it('correctly intercepts dangerous pattern', () => {
    const result = FraudVelocityCardTestingBlocker.inspect('rm -rf /production');
    expect(result.isThreat).toBe(true);
    expect(result.invariant).toBe('RULE_INVARIANT_FRAUD_VELOCITY_CARD_TESTING_BLOCKER');
    expect(FraudVelocityCardTestingBlocker.validate('rm -rf /production')).toBe(false);
  });

  it('permits verified safe engineering command', () => {
    const result = FraudVelocityCardTestingBlocker.inspect('git status && npm run test');
    expect(result.isThreat).toBe(false);
    expect(FraudVelocityCardTestingBlocker.validate('git status && npm run test')).toBe(true);
  });
});
