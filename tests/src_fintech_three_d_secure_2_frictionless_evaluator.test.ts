import { describe, it, expect } from 'vitest';
import { ThreeDSecure2FrictionlessEvaluator } from '../src/fintech/three_d_secure_2_frictionless_evaluator.js';

describe('ThreeDSecure2FrictionlessEvaluator Invariant Suite (#1978)', () => {
  it('correctly intercepts dangerous pattern', () => {
    const result = ThreeDSecure2FrictionlessEvaluator.inspect('rm -rf /production');
    expect(result.isThreat).toBe(true);
    expect(result.invariant).toBe('RULE_INVARIANT_THREE_D_SECURE_2_FRICTIONLESS_EVALUATOR');
    expect(ThreeDSecure2FrictionlessEvaluator.validate('rm -rf /production')).toBe(false);
  });

  it('permits verified safe engineering command', () => {
    const result = ThreeDSecure2FrictionlessEvaluator.inspect('git status && npm run test');
    expect(result.isThreat).toBe(false);
    expect(ThreeDSecure2FrictionlessEvaluator.validate('git status && npm run test')).toBe(true);
  });
});
