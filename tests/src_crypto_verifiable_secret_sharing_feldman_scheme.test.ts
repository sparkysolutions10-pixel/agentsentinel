import { describe, it, expect } from 'vitest';
import { VerifiableSecretSharingFeldmanScheme } from '../src/crypto/verifiable_secret_sharing_feldman_scheme.js';

describe('VerifiableSecretSharingFeldmanScheme Invariant Suite (#2021)', () => {
  it('correctly intercepts dangerous pattern', () => {
    const result = VerifiableSecretSharingFeldmanScheme.inspect('rm -rf /production');
    expect(result.isThreat).toBe(true);
    expect(result.invariant).toBe('RULE_INVARIANT_VERIFIABLE_SECRET_SHARING_FELDMAN_SCHEME');
    expect(VerifiableSecretSharingFeldmanScheme.validate('rm -rf /production')).toBe(false);
  });

  it('permits verified safe engineering command', () => {
    const result = VerifiableSecretSharingFeldmanScheme.inspect('git status && npm run test');
    expect(result.isThreat).toBe(false);
    expect(VerifiableSecretSharingFeldmanScheme.validate('git status && npm run test')).toBe(true);
  });
});
