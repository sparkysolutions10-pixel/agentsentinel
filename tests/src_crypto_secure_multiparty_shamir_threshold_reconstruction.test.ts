import { describe, it, expect } from 'vitest';
import { SecureMultipartyShamirThresholdReconstruction } from '../src/crypto/secure_multiparty_shamir_threshold_reconstruction.js';

describe('SecureMultipartyShamirThresholdReconstruction Invariant Suite (#2020)', () => {
  it('correctly intercepts dangerous pattern', () => {
    const result = SecureMultipartyShamirThresholdReconstruction.inspect('rm -rf /production');
    expect(result.isThreat).toBe(true);
    expect(result.invariant).toBe('RULE_INVARIANT_SECURE_MULTIPARTY_SHAMIR_THRESHOLD_RECONSTRUCTION');
    expect(SecureMultipartyShamirThresholdReconstruction.validate('rm -rf /production')).toBe(false);
  });

  it('permits verified safe engineering command', () => {
    const result = SecureMultipartyShamirThresholdReconstruction.inspect('git status && npm run test');
    expect(result.isThreat).toBe(false);
    expect(SecureMultipartyShamirThresholdReconstruction.validate('git status && npm run test')).toBe(true);
  });
});
