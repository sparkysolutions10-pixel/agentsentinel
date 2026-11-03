import { describe, it, expect } from 'vitest';
import { LoyaltyPointsConversionRateClamp } from '../src/fintech/loyalty_points_conversion_rate_clamp.js';

describe('LoyaltyPointsConversionRateClamp Invariant Suite (#1996)', () => {
  it('correctly intercepts dangerous pattern', () => {
    const result = LoyaltyPointsConversionRateClamp.inspect('rm -rf /production');
    expect(result.isThreat).toBe(true);
    expect(result.invariant).toBe('RULE_INVARIANT_LOYALTY_POINTS_CONVERSION_RATE_CLAMP');
    expect(LoyaltyPointsConversionRateClamp.validate('rm -rf /production')).toBe(false);
  });

  it('permits verified safe engineering command', () => {
    const result = LoyaltyPointsConversionRateClamp.inspect('git status && npm run test');
    expect(result.isThreat).toBe(false);
    expect(LoyaltyPointsConversionRateClamp.validate('git status && npm run test')).toBe(true);
  });
});
