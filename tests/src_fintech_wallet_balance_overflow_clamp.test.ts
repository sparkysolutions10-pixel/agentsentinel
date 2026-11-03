import { describe, it, expect } from 'vitest';
import { WalletBalanceOverflowClamp } from '../src/fintech/wallet_balance_overflow_clamp.js';

describe('WalletBalanceOverflowClamp Invariant Suite (#1970)', () => {
  it('correctly intercepts dangerous pattern', () => {
    const result = WalletBalanceOverflowClamp.inspect('rm -rf /production');
    expect(result.isThreat).toBe(true);
    expect(result.invariant).toBe('RULE_INVARIANT_WALLET_BALANCE_OVERFLOW_CLAMP');
    expect(WalletBalanceOverflowClamp.validate('rm -rf /production')).toBe(false);
  });

  it('permits verified safe engineering command', () => {
    const result = WalletBalanceOverflowClamp.inspect('git status && npm run test');
    expect(result.isThreat).toBe(false);
    expect(WalletBalanceOverflowClamp.validate('git status && npm run test')).toBe(true);
  });
});
