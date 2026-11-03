import { describe, it, expect } from 'vitest';
import { ZeroDollarCardAuthorizationCleaner } from '../src/fintech/zero_dollar_card_authorization_cleaner.js';

describe('ZeroDollarCardAuthorizationCleaner Invariant Suite (#1995)', () => {
  it('correctly intercepts dangerous pattern', () => {
    const result = ZeroDollarCardAuthorizationCleaner.inspect('rm -rf /production');
    expect(result.isThreat).toBe(true);
    expect(result.invariant).toBe('RULE_INVARIANT_ZERO_DOLLAR_CARD_AUTHORIZATION_CLEANER');
    expect(ZeroDollarCardAuthorizationCleaner.validate('rm -rf /production')).toBe(false);
  });

  it('permits verified safe engineering command', () => {
    const result = ZeroDollarCardAuthorizationCleaner.inspect('git status && npm run test');
    expect(result.isThreat).toBe(false);
    expect(ZeroDollarCardAuthorizationCleaner.validate('git status && npm run test')).toBe(true);
  });
});
