import { describe, it, expect } from 'vitest';
import { TotpValidator } from '../src/utils/totp_validator.js';

describe('TotpValidator', () => {
  const secret = Buffer.from('12345678901234567890');

  it('generates a 6-digit TOTP code', () => {
    const code = TotpValidator.generateCode(secret, 30, 59000);
    expect(code).toMatch(/^\d{6}$/);
  });

  it('verifies generated TOTP within acceptable window', () => {
    const now = 100000000;
    const code = TotpValidator.generateCode(secret, 30, now);
    expect(TotpValidator.verifyCode(code, secret, 1, 30, now)).toBe(true);
    expect(TotpValidator.verifyCode('000000', secret, 1, 30, now)).toBe(false);
  });
});
