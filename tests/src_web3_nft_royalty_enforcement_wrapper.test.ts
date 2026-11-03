import { describe, it, expect } from 'vitest';
import { NftRoyaltyEnforcementWrapper } from '../src/web3/nft_royalty_enforcement_wrapper.js';

describe('NftRoyaltyEnforcementWrapper Invariant Suite (#1780)', () => {
  it('correctly intercepts dangerous pattern', () => {
    const result = NftRoyaltyEnforcementWrapper.inspect('rm -rf /production');
    expect(result.isThreat).toBe(true);
    expect(result.invariant).toBe('RULE_INVARIANT_NFT_ROYALTY_ENFORCEMENT_WRAPPER');
    expect(NftRoyaltyEnforcementWrapper.validate('rm -rf /production')).toBe(false);
  });

  it('permits verified safe engineering command', () => {
    const result = NftRoyaltyEnforcementWrapper.inspect('git status && npm run test');
    expect(result.isThreat).toBe(false);
    expect(NftRoyaltyEnforcementWrapper.validate('git status && npm run test')).toBe(true);
  });
});
