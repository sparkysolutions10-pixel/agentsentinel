import { describe, it, expect } from 'vitest';
import { BranchlessEvaluator } from '../src/crypto/branchless_evaluator.js';

describe('Branchless Evaluation (#861 & #862)', () => {
  it('correctly evaluates equality branchlessly', () => {
    expect(BranchlessEvaluator.equals32(42, 42)).toBe(1);
    expect(BranchlessEvaluator.equals32(42, 43)).toBe(0);
    expect(BranchlessEvaluator.equals32(0, 0)).toBe(1);
    expect(BranchlessEvaluator.equals32(0, 1)).toBe(0);
  });

  it('selects values without branching', () => {
    expect(BranchlessEvaluator.select32(1, 100, 200)).toBe(100);
    expect(BranchlessEvaluator.select32(0, 100, 200)).toBe(200);
  });

  it('compares buffers constant-time without branch divergence', () => {
    const a = new Uint8Array([1, 2, 3, 4]);
    const b = new Uint8Array([1, 2, 3, 4]);
    const c = new Uint8Array([1, 2, 3, 5]);

    expect(BranchlessEvaluator.constantTimeCompare(a, b)).toBe(1);
    expect(BranchlessEvaluator.constantTimeCompare(a, c)).toBe(0);
  });
});
