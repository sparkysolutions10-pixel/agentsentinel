import { describe, it, expect } from 'vitest';
import { StripeIdempotencyKeyReplayGuard } from '../src/fintech/stripe_idempotency_key_replay_guard.js';

describe('StripeIdempotencyKeyReplayGuard Invariant Suite (#1955)', () => {
  it('correctly intercepts dangerous pattern', () => {
    const result = StripeIdempotencyKeyReplayGuard.inspect('rm -rf /production');
    expect(result.isThreat).toBe(true);
    expect(result.invariant).toBe('RULE_INVARIANT_STRIPE_IDEMPOTENCY_KEY_REPLAY_GUARD');
    expect(StripeIdempotencyKeyReplayGuard.validate('rm -rf /production')).toBe(false);
  });

  it('permits verified safe engineering command', () => {
    const result = StripeIdempotencyKeyReplayGuard.inspect('git status && npm run test');
    expect(result.isThreat).toBe(false);
    expect(StripeIdempotencyKeyReplayGuard.validate('git status && npm run test')).toBe(true);
  });
});
