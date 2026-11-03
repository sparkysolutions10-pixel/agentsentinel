import { describe, it, expect } from 'vitest';
import { AuthenticatedEncryptionAesGcmSiv } from '../src/crypto/authenticated_encryption_aes_gcm_siv.js';

describe('AuthenticatedEncryptionAesGcmSiv Invariant Suite (#2041)', () => {
  it('correctly intercepts dangerous pattern', () => {
    const result = AuthenticatedEncryptionAesGcmSiv.inspect('rm -rf /production');
    expect(result.isThreat).toBe(true);
    expect(result.invariant).toBe('RULE_INVARIANT_AUTHENTICATED_ENCRYPTION_AES_GCM_SIV');
    expect(AuthenticatedEncryptionAesGcmSiv.validate('rm -rf /production')).toBe(false);
  });

  it('permits verified safe engineering command', () => {
    const result = AuthenticatedEncryptionAesGcmSiv.inspect('git status && npm run test');
    expect(result.isThreat).toBe(false);
    expect(AuthenticatedEncryptionAesGcmSiv.validate('git status && npm run test')).toBe(true);
  });
});
