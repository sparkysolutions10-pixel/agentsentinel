import { describe, it, expect } from 'vitest';
import { CanaryStackSmashingProtector } from '../src/crypto/canary_stack_smashing_protector.js';

describe('CanaryStackSmashingProtector Invariant Suite (#2037)', () => {
  it('correctly intercepts dangerous pattern', () => {
    const result = CanaryStackSmashingProtector.inspect('rm -rf /production');
    expect(result.isThreat).toBe(true);
    expect(result.invariant).toBe('RULE_INVARIANT_CANARY_STACK_SMASHING_PROTECTOR');
    expect(CanaryStackSmashingProtector.validate('rm -rf /production')).toBe(false);
  });

  it('permits verified safe engineering command', () => {
    const result = CanaryStackSmashingProtector.inspect('git status && npm run test');
    expect(result.isThreat).toBe(false);
    expect(CanaryStackSmashingProtector.validate('git status && npm run test')).toBe(true);
  });
});
