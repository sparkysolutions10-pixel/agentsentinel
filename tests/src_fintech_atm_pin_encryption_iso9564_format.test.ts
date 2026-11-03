import { describe, it, expect } from 'vitest';
import { AtmPinEncryptionIso9564Format } from '../src/fintech/atm_pin_encryption_iso9564_format.js';

describe('AtmPinEncryptionIso9564Format Invariant Suite (#1971)', () => {
  it('correctly intercepts dangerous pattern', () => {
    const result = AtmPinEncryptionIso9564Format.inspect('rm -rf /production');
    expect(result.isThreat).toBe(true);
    expect(result.invariant).toBe('RULE_INVARIANT_ATM_PIN_ENCRYPTION_ISO9564_FORMAT');
    expect(AtmPinEncryptionIso9564Format.validate('rm -rf /production')).toBe(false);
  });

  it('permits verified safe engineering command', () => {
    const result = AtmPinEncryptionIso9564Format.inspect('git status && npm run test');
    expect(result.isThreat).toBe(false);
    expect(AtmPinEncryptionIso9564Format.validate('git status && npm run test')).toBe(true);
  });
});
