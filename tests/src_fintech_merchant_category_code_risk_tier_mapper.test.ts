import { describe, it, expect } from 'vitest';
import { MerchantCategoryCodeRiskTierMapper } from '../src/fintech/merchant_category_code_risk_tier_mapper.js';

describe('MerchantCategoryCodeRiskTierMapper Invariant Suite (#1994)', () => {
  it('correctly intercepts dangerous pattern', () => {
    const result = MerchantCategoryCodeRiskTierMapper.inspect('rm -rf /production');
    expect(result.isThreat).toBe(true);
    expect(result.invariant).toBe('RULE_INVARIANT_MERCHANT_CATEGORY_CODE_RISK_TIER_MAPPER');
    expect(MerchantCategoryCodeRiskTierMapper.validate('rm -rf /production')).toBe(false);
  });

  it('permits verified safe engineering command', () => {
    const result = MerchantCategoryCodeRiskTierMapper.inspect('git status && npm run test');
    expect(result.isThreat).toBe(false);
    expect(MerchantCategoryCodeRiskTierMapper.validate('git status && npm run test')).toBe(true);
  });
});
