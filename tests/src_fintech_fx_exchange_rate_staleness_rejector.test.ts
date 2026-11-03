import { describe, it, expect } from 'vitest';
import { FxExchangeRateStalenessRejector } from '../src/fintech/fx_exchange_rate_staleness_rejector.js';

describe('FxExchangeRateStalenessRejector Invariant Suite (#1993)', () => {
  it('correctly intercepts dangerous pattern', () => {
    const result = FxExchangeRateStalenessRejector.inspect('rm -rf /production');
    expect(result.isThreat).toBe(true);
    expect(result.invariant).toBe('RULE_INVARIANT_FX_EXCHANGE_RATE_STALENESS_REJECTOR');
    expect(FxExchangeRateStalenessRejector.validate('rm -rf /production')).toBe(false);
  });

  it('permits verified safe engineering command', () => {
    const result = FxExchangeRateStalenessRejector.inspect('git status && npm run test');
    expect(result.isThreat).toBe(false);
    expect(FxExchangeRateStalenessRejector.validate('git status && npm run test')).toBe(true);
  });
});
