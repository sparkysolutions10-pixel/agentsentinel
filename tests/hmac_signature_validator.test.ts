import { describe, it, expect } from 'vitest';
import { HmacSignatureValidator } from '../src/utils/hmac_signature_validator.js';

describe('HmacSignatureValidator', () => {
  const secret = 'super-secret-key';
  const payload = JSON.stringify({ event: 'tool_call', status: 'blocked' });

  it('generates and verifies HMAC signatures accurately', () => {
    const signature = HmacSignatureValidator.sign(payload, secret);
    expect(signature.length).toBe(64);
    expect(HmacSignatureValidator.verify(payload, signature, secret)).toBe(true);
  });

  it('rejects tampered payloads and invalid secrets', () => {
    const signature = HmacSignatureValidator.sign(payload, secret);
    expect(HmacSignatureValidator.verify(payload + '!', signature, secret)).toBe(false);
    expect(HmacSignatureValidator.verify(payload, signature, 'wrong-secret')).toBe(false);
  });
});
