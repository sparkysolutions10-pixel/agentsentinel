import { describe, it, expect } from 'vitest';
import { DifferentialPrivacyGaussianMechanism } from '../src/crypto/differential_privacy_gaussian_mechanism.js';

describe('DifferentialPrivacyGaussianMechanism Invariant Suite (#2026)', () => {
  it('correctly intercepts dangerous pattern', () => {
    const result = DifferentialPrivacyGaussianMechanism.inspect('rm -rf /production');
    expect(result.isThreat).toBe(true);
    expect(result.invariant).toBe('RULE_INVARIANT_DIFFERENTIAL_PRIVACY_GAUSSIAN_MECHANISM');
    expect(DifferentialPrivacyGaussianMechanism.validate('rm -rf /production')).toBe(false);
  });

  it('permits verified safe engineering command', () => {
    const result = DifferentialPrivacyGaussianMechanism.inspect('git status && npm run test');
    expect(result.isThreat).toBe(false);
    expect(DifferentialPrivacyGaussianMechanism.validate('git status && npm run test')).toBe(true);
  });
});
