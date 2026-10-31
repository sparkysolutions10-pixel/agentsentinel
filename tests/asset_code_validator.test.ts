import { describe, it, expect } from 'vitest';
import { AssetCodeValidator } from '../src/utils/asset_code_validator.js';

describe('AssetCodeValidator', () => {
  const validIssuer = 'GBBD47IF6LWK7P7MDEVSCWR7DPUWV3NY3DTQEVFL4NAT4AQH3ZLLFLA5';

  it('validates native XLM asset', () => {
    expect(AssetCodeValidator.isNative('XLM')).toBe(true);
    expect(AssetCodeValidator.isNative('native')).toBe(true);
    expect(AssetCodeValidator.parse('XLM')).toEqual({ type: 'native', code: 'XLM' });
  });

  it('classifies AlphaNum4 correctly', () => {
    expect(AssetCodeValidator.validateAssetCode('USDC')).toBe('credit_alphanum4');
    expect(AssetCodeValidator.validateAssetCode('EUR')).toBe('credit_alphanum4');
  });

  it('classifies AlphaNum12 correctly', () => {
    expect(AssetCodeValidator.validateAssetCode('STELLARTOKEN')).toBe('credit_alphanum12');
  });

  it('rejects invalid asset codes (> 12 chars or special chars)', () => {
    expect(AssetCodeValidator.validateAssetCode('VERYLONGTOKENNAME')).toBeNull();
    expect(AssetCodeValidator.validateAssetCode('USD$')).toBeNull();
  });

  it('parses valid credit asset strings', () => {
    const asset = AssetCodeValidator.parse(`USDC:${validIssuer}`);
    expect(asset).toEqual({
      type: 'credit_alphanum4',
      code: 'USDC',
      issuer: validIssuer
    });
  });

  it('rejects invalid issuer addresses', () => {
    expect(AssetCodeValidator.parse('USDC:INVALID_ISSUER')).toBeNull();
  });
});
