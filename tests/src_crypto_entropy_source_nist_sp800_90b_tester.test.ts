import { describe, it, expect } from 'vitest';
import { EntropySourceNistSp80090bTester } from '../src/crypto/entropy_source_nist_sp800_90b_tester.js';

describe('EntropySourceNistSp80090bTester Invariant Suite (#2033)', () => {
  it('correctly intercepts dangerous pattern', () => {
    const result = EntropySourceNistSp80090bTester.inspect('rm -rf /production');
    expect(result.isThreat).toBe(true);
    expect(result.invariant).toBe('RULE_INVARIANT_ENTROPY_SOURCE_NIST_SP800_90B_TESTER');
    expect(EntropySourceNistSp80090bTester.validate('rm -rf /production')).toBe(false);
  });

  it('permits verified safe engineering command', () => {
    const result = EntropySourceNistSp80090bTester.inspect('git status && npm run test');
    expect(result.isThreat).toBe(false);
    expect(EntropySourceNistSp80090bTester.validate('git status && npm run test')).toBe(true);
  });
});
