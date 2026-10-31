import { describe, it, expect } from 'vitest';
import { createStellarIntermediateAssetTrustlineRule } from '../src/web3/stellar_intermediate_asset.js';
import { Verdict } from '../src/types.js';

describe('StellarIntermediateAssetTrustlineRule', () => {
  it('allows paths with liquid intermediate assets', () => {
    const rule = createStellarIntermediateAssetTrustlineRule();
    const violation = rule.evaluate({
      toolName: 'stellar_path_payment_send',
      params: { path: [{ code: 'EURC', issuer: 'GABC...', liquidity: 50000 }] }
    });
    expect(violation).toBeNull();
  });

  it('blocks paths routing through zero-liquidity intermediate assets', () => {
    const rule = createStellarIntermediateAssetTrustlineRule();
    const violation = rule.evaluate({
      toolName: 'stellar_path_payment_send',
      params: { path: [{ code: 'DEADCOIN', liquidity: 0 }] }
    });
    expect(violation).not.toBeNull();
    expect(violation?.verdict).toBe(Verdict.BLOCK);
    expect(violation?.detectedPattern).toContain('ZERO_LIQUIDITY_INTERMEDIATE_ASSET');
  });

  it('blocks paths routing through blacklisted issuers', () => {
    const rule = createStellarIntermediateAssetTrustlineRule({ blockedIssuers: ['GBAD_ISSUER_999'] });
    const violation = rule.evaluate({
      toolName: 'stellar_path_payment_send',
      params: { path: [{ code: 'BAD_USD', issuer: 'GBAD_ISSUER_999', liquidity: 1000 }] }
    });
    expect(violation).not.toBeNull();
    expect(violation?.verdict).toBe(Verdict.BLOCK);
    expect(violation?.severity).toBe('critical');
    expect(violation?.detectedPattern).toContain('BLACKLISTED_ISSUER_IN_PATH');
  });
});
