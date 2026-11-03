import { describe, it, expect } from 'vitest';
import { Tpm20EndorsementKeyAuthenticator } from '../src/crypto/tpm_20_endorsement_key_authenticator.js';

describe('Tpm20EndorsementKeyAuthenticator Invariant Suite (#2031)', () => {
  it('correctly intercepts dangerous pattern', () => {
    const result = Tpm20EndorsementKeyAuthenticator.inspect('rm -rf /production');
    expect(result.isThreat).toBe(true);
    expect(result.invariant).toBe('RULE_INVARIANT_TPM_20_ENDORSEMENT_KEY_AUTHENTICATOR');
    expect(Tpm20EndorsementKeyAuthenticator.validate('rm -rf /production')).toBe(false);
  });

  it('permits verified safe engineering command', () => {
    const result = Tpm20EndorsementKeyAuthenticator.inspect('git status && npm run test');
    expect(result.isThreat).toBe(false);
    expect(Tpm20EndorsementKeyAuthenticator.validate('git status && npm run test')).toBe(true);
  });
});
