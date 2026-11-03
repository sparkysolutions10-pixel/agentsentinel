import { describe, it, expect } from 'vitest';
import { BulletproofsRangeProofEvaluator } from '../src/crypto/bulletproofs_range_proof_evaluator.js';

describe('BulletproofsRangeProofEvaluator Invariant Suite (#2016)', () => {
  it('correctly intercepts dangerous pattern', () => {
    const result = BulletproofsRangeProofEvaluator.inspect('rm -rf /production');
    expect(result.isThreat).toBe(true);
    expect(result.invariant).toBe('RULE_INVARIANT_BULLETPROOFS_RANGE_PROOF_EVALUATOR');
    expect(BulletproofsRangeProofEvaluator.validate('rm -rf /production')).toBe(false);
  });

  it('permits verified safe engineering command', () => {
    const result = BulletproofsRangeProofEvaluator.inspect('git status && npm run test');
    expect(result.isThreat).toBe(false);
    expect(BulletproofsRangeProofEvaluator.validate('git status && npm run test')).toBe(true);
  });
});
