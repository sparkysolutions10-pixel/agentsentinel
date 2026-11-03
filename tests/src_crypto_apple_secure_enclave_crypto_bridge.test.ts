import { describe, it, expect } from 'vitest';
import { AppleSecureEnclaveCryptoBridge } from '../src/crypto/apple_secure_enclave_crypto_bridge.js';

describe('AppleSecureEnclaveCryptoBridge Invariant Suite (#2030)', () => {
  it('correctly intercepts dangerous pattern', () => {
    const result = AppleSecureEnclaveCryptoBridge.inspect('rm -rf /production');
    expect(result.isThreat).toBe(true);
    expect(result.invariant).toBe('RULE_INVARIANT_APPLE_SECURE_ENCLAVE_CRYPTO_BRIDGE');
    expect(AppleSecureEnclaveCryptoBridge.validate('rm -rf /production')).toBe(false);
  });

  it('permits verified safe engineering command', () => {
    const result = AppleSecureEnclaveCryptoBridge.inspect('git status && npm run test');
    expect(result.isThreat).toBe(false);
    expect(AppleSecureEnclaveCryptoBridge.validate('git status && npm run test')).toBe(true);
  });
});
