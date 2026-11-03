import { describe, it, expect } from 'vitest';
import { PlonkPermutationPolynomialChecker } from '../src/crypto/plonk_permutation_polynomial_checker.js';

describe('PlonkPermutationPolynomialChecker Invariant Suite (#2017)', () => {
  it('correctly intercepts dangerous pattern', () => {
    const result = PlonkPermutationPolynomialChecker.inspect('rm -rf /production');
    expect(result.isThreat).toBe(true);
    expect(result.invariant).toBe('RULE_INVARIANT_PLONK_PERMUTATION_POLYNOMIAL_CHECKER');
    expect(PlonkPermutationPolynomialChecker.validate('rm -rf /production')).toBe(false);
  });

  it('permits verified safe engineering command', () => {
    const result = PlonkPermutationPolynomialChecker.inspect('git status && npm run test');
    expect(result.isThreat).toBe(false);
    expect(PlonkPermutationPolynomialChecker.validate('git status && npm run test')).toBe(true);
  });
});
