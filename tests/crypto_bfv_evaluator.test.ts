import { describe, it, expect } from 'vitest';
import { BFVIntegerEvaluator } from '../src/crypto/bfv_evaluator.js';

describe('BFV/BGV Integer Homomorphic Evaluator (#837 & #838)', () => {
  it('performs exact arithmetic comparisons over encrypted integer values', () => {
    const val = 150;
    const threshold = 100;
    const res = BFVIntegerEvaluator.evaluateThreshold(val, threshold);
    expect(res.isViolated).toBe(true);

    const safeVal = 50;
    const res2 = BFVIntegerEvaluator.evaluateThreshold(safeVal, threshold);
    expect(res2.isViolated).toBe(false);
  });
});
