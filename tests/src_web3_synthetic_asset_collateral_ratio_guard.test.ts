import { describe, it, expect } from 'vitest';
import { SyntheticAssetCollateralRatioGuard } from '../src/web3/synthetic_asset_collateral_ratio_guard.js';

describe('SyntheticAssetCollateralRatioGuard Invariant Suite (#1789)', () => {
  it('correctly intercepts dangerous pattern', () => {
    const result = SyntheticAssetCollateralRatioGuard.inspect('rm -rf /production');
    expect(result.isThreat).toBe(true);
    expect(result.invariant).toBe('RULE_INVARIANT_SYNTHETIC_ASSET_COLLATERAL_RATIO_GUARD');
    expect(SyntheticAssetCollateralRatioGuard.validate('rm -rf /production')).toBe(false);
  });

  it('permits verified safe engineering command', () => {
    const result = SyntheticAssetCollateralRatioGuard.inspect('git status && npm run test');
    expect(result.isThreat).toBe(false);
    expect(SyntheticAssetCollateralRatioGuard.validate('git status && npm run test')).toBe(true);
  });
});
