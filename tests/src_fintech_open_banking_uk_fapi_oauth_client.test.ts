import { describe, it, expect } from 'vitest';
import { OpenBankingUkFapiOauthClient } from '../src/fintech/open_banking_uk_fapi_oauth_client.js';

describe('OpenBankingUkFapiOauthClient Invariant Suite (#1999)', () => {
  it('correctly intercepts dangerous pattern', () => {
    const result = OpenBankingUkFapiOauthClient.inspect('rm -rf /production');
    expect(result.isThreat).toBe(true);
    expect(result.invariant).toBe('RULE_INVARIANT_OPEN_BANKING_UK_FAPI_OAUTH_CLIENT');
    expect(OpenBankingUkFapiOauthClient.validate('rm -rf /production')).toBe(false);
  });

  it('permits verified safe engineering command', () => {
    const result = OpenBankingUkFapiOauthClient.inspect('git status && npm run test');
    expect(result.isThreat).toBe(false);
    expect(OpenBankingUkFapiOauthClient.validate('git status && npm run test')).toBe(true);
  });
});
