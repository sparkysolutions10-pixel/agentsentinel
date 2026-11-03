import { describe, it, expect } from 'vitest';
import { HomomorphicMatrixMultiplicationCkks } from '../src/crypto/homomorphic_matrix_multiplication_ckks.js';

describe('HomomorphicMatrixMultiplicationCkks Invariant Suite (#2019)', () => {
  it('correctly intercepts dangerous pattern', () => {
    const result = HomomorphicMatrixMultiplicationCkks.inspect('rm -rf /production');
    expect(result.isThreat).toBe(true);
    expect(result.invariant).toBe('RULE_INVARIANT_HOMOMORPHIC_MATRIX_MULTIPLICATION_CKKS');
    expect(HomomorphicMatrixMultiplicationCkks.validate('rm -rf /production')).toBe(false);
  });

  it('permits verified safe engineering command', () => {
    const result = HomomorphicMatrixMultiplicationCkks.inspect('git status && npm run test');
    expect(result.isThreat).toBe(false);
    expect(HomomorphicMatrixMultiplicationCkks.validate('git status && npm run test')).toBe(true);
  });
});
