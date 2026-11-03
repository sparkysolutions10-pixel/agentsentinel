import { describe, it, expect } from 'vitest';
import { Erc4337PaymasterBalanceGuard } from '../src/web3/erc4337_paymaster_balance_guard.js';

describe('Erc4337PaymasterBalanceGuard Invariant Suite (#1764)', () => {
  it('correctly intercepts dangerous pattern', () => {
    const result = Erc4337PaymasterBalanceGuard.inspect('rm -rf /production');
    expect(result.isThreat).toBe(true);
    expect(result.invariant).toBe('RULE_INVARIANT_ERC4337_PAYMASTER_BALANCE_GUARD');
    expect(Erc4337PaymasterBalanceGuard.validate('rm -rf /production')).toBe(false);
  });

  it('permits verified safe engineering command', () => {
    const result = Erc4337PaymasterBalanceGuard.inspect('git status && npm run test');
    expect(result.isThreat).toBe(false);
    expect(Erc4337PaymasterBalanceGuard.validate('git status && npm run test')).toBe(true);
  });
});
