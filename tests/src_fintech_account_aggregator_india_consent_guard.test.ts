import { describe, it, expect } from 'vitest';
import { AccountAggregatorIndiaConsentGuard } from '../src/fintech/account_aggregator_india_consent_guard.js';

describe('AccountAggregatorIndiaConsentGuard Invariant Suite (#2000)', () => {
  it('correctly intercepts dangerous pattern', () => {
    const result = AccountAggregatorIndiaConsentGuard.inspect('rm -rf /production');
    expect(result.isThreat).toBe(true);
    expect(result.invariant).toBe('RULE_INVARIANT_ACCOUNT_AGGREGATOR_INDIA_CONSENT_GUARD');
    expect(AccountAggregatorIndiaConsentGuard.validate('rm -rf /production')).toBe(false);
  });

  it('permits verified safe engineering command', () => {
    const result = AccountAggregatorIndiaConsentGuard.inspect('git status && npm run test');
    expect(result.isThreat).toBe(false);
    expect(AccountAggregatorIndiaConsentGuard.validate('git status && npm run test')).toBe(true);
  });
});
