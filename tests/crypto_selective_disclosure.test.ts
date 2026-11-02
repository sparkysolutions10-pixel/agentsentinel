import { describe, it, expect } from 'vitest';
import { SelectiveDisclosureCredentials, CredentialClaim } from '../src/crypto/selective_disclosure.js';

describe('Selective Disclosure Credentials (#813 & #814)', () => {
  it('verifies permissions while concealing sensitive personal identity', () => {
    const claims: CredentialClaim[] = [
      { key: 'role', value: 'security_auditor', blinded: false },
      { key: 'name', value: 'John Doe', blinded: true },
      { key: 'email', value: 'john@enterprise.com', blinded: true }
    ];

    const disclosed = SelectiveDisclosureCredentials.discloseClaims(claims, ['role']);
    expect(disclosed['role']).toBe('security_auditor');
    expect(disclosed['name']).toBe('[REDACTED_IDENTITY]');
    expect(disclosed['email']).toBe('[REDACTED_IDENTITY]');
  });
});
