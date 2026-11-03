import { describe, it, expect } from 'vitest';
import { WrappedTokenBurnMintReconciliation } from '../src/web3/wrapped_token_burn_mint_reconciliation.js';

describe('WrappedTokenBurnMintReconciliation Invariant Suite (#1796)', () => {
  it('correctly intercepts dangerous pattern', () => {
    const result = WrappedTokenBurnMintReconciliation.inspect('rm -rf /production');
    expect(result.isThreat).toBe(true);
    expect(result.invariant).toBe('RULE_INVARIANT_WRAPPED_TOKEN_BURN_MINT_RECONCILIATION');
    expect(WrappedTokenBurnMintReconciliation.validate('rm -rf /production')).toBe(false);
  });

  it('permits verified safe engineering command', () => {
    const result = WrappedTokenBurnMintReconciliation.inspect('git status && npm run test');
    expect(result.isThreat).toBe(false);
    expect(WrappedTokenBurnMintReconciliation.validate('git status && npm run test')).toBe(true);
  });
});
