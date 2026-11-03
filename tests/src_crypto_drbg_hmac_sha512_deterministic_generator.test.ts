import { describe, it, expect } from 'vitest';
import { DrbgHmacSha512DeterministicGenerator } from '../src/crypto/drbg_hmac_sha512_deterministic_generator.js';

describe('DrbgHmacSha512DeterministicGenerator Invariant Suite (#2034)', () => {
  it('correctly intercepts dangerous pattern', () => {
    const result = DrbgHmacSha512DeterministicGenerator.inspect('rm -rf /production');
    expect(result.isThreat).toBe(true);
    expect(result.invariant).toBe('RULE_INVARIANT_DRBG_HMAC_SHA512_DETERMINISTIC_GENERATOR');
    expect(DrbgHmacSha512DeterministicGenerator.validate('rm -rf /production')).toBe(false);
  });

  it('permits verified safe engineering command', () => {
    const result = DrbgHmacSha512DeterministicGenerator.inspect('git status && npm run test');
    expect(result.isThreat).toBe(false);
    expect(DrbgHmacSha512DeterministicGenerator.validate('git status && npm run test')).toBe(true);
  });
});
