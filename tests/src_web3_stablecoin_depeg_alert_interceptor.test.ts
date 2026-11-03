import { describe, it, expect } from 'vitest';
import { StablecoinDepegAlertInterceptor } from '../src/web3/stablecoin_depeg_alert_interceptor.js';

describe('StablecoinDepegAlertInterceptor Invariant Suite (#1795)', () => {
  it('correctly intercepts dangerous pattern', () => {
    const result = StablecoinDepegAlertInterceptor.inspect('rm -rf /production');
    expect(result.isThreat).toBe(true);
    expect(result.invariant).toBe('RULE_INVARIANT_STABLECOIN_DEPEG_ALERT_INTERCEPTOR');
    expect(StablecoinDepegAlertInterceptor.validate('rm -rf /production')).toBe(false);
  });

  it('permits verified safe engineering command', () => {
    const result = StablecoinDepegAlertInterceptor.inspect('git status && npm run test');
    expect(result.isThreat).toBe(false);
    expect(StablecoinDepegAlertInterceptor.validate('git status && npm run test')).toBe(true);
  });
});
