import { describe, it, expect } from 'vitest';
import { CryptoAssetSymbolSpoofDetector } from '../src/web3/crypto_asset_symbol_spoof_detector.js';

describe('CryptoAssetSymbolSpoofDetector Invariant Suite (#1783)', () => {
  it('correctly intercepts dangerous pattern', () => {
    const result = CryptoAssetSymbolSpoofDetector.inspect('rm -rf /production');
    expect(result.isThreat).toBe(true);
    expect(result.invariant).toBe('RULE_INVARIANT_CRYPTO_ASSET_SYMBOL_SPOOF_DETECTOR');
    expect(CryptoAssetSymbolSpoofDetector.validate('rm -rf /production')).toBe(false);
  });

  it('permits verified safe engineering command', () => {
    const result = CryptoAssetSymbolSpoofDetector.inspect('git status && npm run test');
    expect(result.isThreat).toBe(false);
    expect(CryptoAssetSymbolSpoofDetector.validate('git status && npm run test')).toBe(true);
  });
});
