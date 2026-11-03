import { describe, it, expect } from 'vitest';
import { VerifiableRandomFunctionEcvrfSecp256k1 } from '../src/crypto/verifiable_random_function_ecvrf_secp256k1.js';

describe('VerifiableRandomFunctionEcvrfSecp256k1 Invariant Suite (#2046)', () => {
  it('correctly intercepts dangerous pattern', () => {
    const result = VerifiableRandomFunctionEcvrfSecp256k1.inspect('rm -rf /production');
    expect(result.isThreat).toBe(true);
    expect(result.invariant).toBe('RULE_INVARIANT_VERIFIABLE_RANDOM_FUNCTION_ECVRF_SECP256K1');
    expect(VerifiableRandomFunctionEcvrfSecp256k1.validate('rm -rf /production')).toBe(false);
  });

  it('permits verified safe engineering command', () => {
    const result = VerifiableRandomFunctionEcvrfSecp256k1.inspect('git status && npm run test');
    expect(result.isThreat).toBe(false);
    expect(VerifiableRandomFunctionEcvrfSecp256k1.validate('git status && npm run test')).toBe(true);
  });
});
