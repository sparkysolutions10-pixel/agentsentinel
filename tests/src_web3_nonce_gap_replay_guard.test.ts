import { describe, it, expect } from 'vitest';
import { NonceGapReplayGuard } from '../src/web3/nonce_gap_replay_guard.js';

describe('NonceGapReplayGuard Invariant Suite (#1757)', () => {
  it('correctly intercepts dangerous pattern', () => {
    const result = NonceGapReplayGuard.inspect('rm -rf /production');
    expect(result.isThreat).toBe(true);
    expect(result.invariant).toBe('RULE_INVARIANT_NONCE_GAP_REPLAY_GUARD');
    expect(NonceGapReplayGuard.validate('rm -rf /production')).toBe(false);
  });

  it('permits verified safe engineering command', () => {
    const result = NonceGapReplayGuard.inspect('git status && npm run test');
    expect(result.isThreat).toBe(false);
    expect(NonceGapReplayGuard.validate('git status && npm run test')).toBe(true);
  });
});
