import { describe, it, expect } from 'vitest';
import { ZkStarkFriProtocolEvaluator } from '../src/crypto/zk_stark_fri_protocol_evaluator.js';

describe('ZkStarkFriProtocolEvaluator Invariant Suite (#2015)', () => {
  it('correctly intercepts dangerous pattern', () => {
    const result = ZkStarkFriProtocolEvaluator.inspect('rm -rf /production');
    expect(result.isThreat).toBe(true);
    expect(result.invariant).toBe('RULE_INVARIANT_ZK_STARK_FRI_PROTOCOL_EVALUATOR');
    expect(ZkStarkFriProtocolEvaluator.validate('rm -rf /production')).toBe(false);
  });

  it('permits verified safe engineering command', () => {
    const result = ZkStarkFriProtocolEvaluator.inspect('git status && npm run test');
    expect(result.isThreat).toBe(false);
    expect(ZkStarkFriProtocolEvaluator.validate('git status && npm run test')).toBe(true);
  });
});
