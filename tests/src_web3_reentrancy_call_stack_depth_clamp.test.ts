import { describe, it, expect } from 'vitest';
import { ReentrancyCallStackDepthClamp } from '../src/web3/reentrancy_call_stack_depth_clamp.js';

describe('ReentrancyCallStackDepthClamp Invariant Suite (#1778)', () => {
  it('correctly intercepts dangerous pattern', () => {
    const result = ReentrancyCallStackDepthClamp.inspect('rm -rf /production');
    expect(result.isThreat).toBe(true);
    expect(result.invariant).toBe('RULE_INVARIANT_REENTRANCY_CALL_STACK_DEPTH_CLAMP');
    expect(ReentrancyCallStackDepthClamp.validate('rm -rf /production')).toBe(false);
  });

  it('permits verified safe engineering command', () => {
    const result = ReentrancyCallStackDepthClamp.inspect('git status && npm run test');
    expect(result.isThreat).toBe(false);
    expect(ReentrancyCallStackDepthClamp.validate('git status && npm run test')).toBe(true);
  });
});
