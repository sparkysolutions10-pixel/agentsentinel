import { describe, it, expect } from 'vitest';
import { createVectorNormBoundsCheckerRule } from '../src/rag/vector_norm_bounds_checker.js';
import { Verdict } from '../src/types.js';

describe('VectorNormBoundsChecker', () => {
  const rule = createVectorNormBoundsCheckerRule(0.05);

  it('accepts accurately normalized unit vectors', () => {
    // [0.6, 0.8] has norm sqrt(0.36 + 0.64) = 1.0
    const violation = rule.evaluate({
      toolName: 'norm_check',
      params: { vector: [0.6, 0.8], isNormalized: true }
    });
    expect(violation).toBeNull();
  });

  it('rejects unit vector with distorted norm', () => {
    const violation = rule.evaluate({
      toolName: 'norm_check',
      params: { vector: [0.9, 0.9], isNormalized: true }
    });
    expect(violation).not.toBeNull();
    expect(violation?.verdict).toBe(Verdict.BLOCK);
  });
});
