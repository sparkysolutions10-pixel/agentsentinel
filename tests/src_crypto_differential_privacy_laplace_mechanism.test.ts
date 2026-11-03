import { describe, it, expect } from 'vitest';
import { DifferentialPrivacyLaplaceMechanism } from '../src/crypto/differential_privacy_laplace_mechanism.js';

describe('DifferentialPrivacyLaplaceMechanism Invariant Suite (#2025)', () => {
  it('correctly intercepts dangerous pattern', () => {
    const result = DifferentialPrivacyLaplaceMechanism.inspect('rm -rf /production');
    expect(result.isThreat).toBe(true);
    expect(result.invariant).toBe('RULE_INVARIANT_DIFFERENTIAL_PRIVACY_LAPLACE_MECHANISM');
    expect(DifferentialPrivacyLaplaceMechanism.validate('rm -rf /production')).toBe(false);
  });

  it('permits verified safe engineering command', () => {
    const result = DifferentialPrivacyLaplaceMechanism.inspect('git status && npm run test');
    expect(result.isThreat).toBe(false);
    expect(DifferentialPrivacyLaplaceMechanism.validate('git status && npm run test')).toBe(true);
  });
});
