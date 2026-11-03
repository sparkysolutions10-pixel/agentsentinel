import { describe, it, expect } from 'vitest';
import { BlindSignatureRsaChaumProtocol } from '../src/crypto/blind_signature_rsa_chaum_protocol.js';

describe('BlindSignatureRsaChaumProtocol Invariant Suite (#2044)', () => {
  it('correctly intercepts dangerous pattern', () => {
    const result = BlindSignatureRsaChaumProtocol.inspect('rm -rf /production');
    expect(result.isThreat).toBe(true);
    expect(result.invariant).toBe('RULE_INVARIANT_BLIND_SIGNATURE_RSA_CHAUM_PROTOCOL');
    expect(BlindSignatureRsaChaumProtocol.validate('rm -rf /production')).toBe(false);
  });

  it('permits verified safe engineering command', () => {
    const result = BlindSignatureRsaChaumProtocol.inspect('git status && npm run test');
    expect(result.isThreat).toBe(false);
    expect(BlindSignatureRsaChaumProtocol.validate('git status && npm run test')).toBe(true);
  });
});
