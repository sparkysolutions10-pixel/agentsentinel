import { describe, it, expect } from 'vitest';
import { HotWalletRateLimiter } from '../src/web3/hot_wallet_rate_limiter.js';

describe('HotWalletRateLimiter Invariant Suite (#1761)', () => {
  it('correctly intercepts dangerous pattern', () => {
    const result = HotWalletRateLimiter.inspect('rm -rf /production');
    expect(result.isThreat).toBe(true);
    expect(result.invariant).toBe('RULE_INVARIANT_HOT_WALLET_RATE_LIMITER');
    expect(HotWalletRateLimiter.validate('rm -rf /production')).toBe(false);
  });

  it('permits verified safe engineering command', () => {
    const result = HotWalletRateLimiter.inspect('git status && npm run test');
    expect(result.isThreat).toBe(false);
    expect(HotWalletRateLimiter.validate('git status && npm run test')).toBe(true);
  });
});
