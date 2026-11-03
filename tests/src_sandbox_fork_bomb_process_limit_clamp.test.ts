import { describe, it, expect } from 'vitest';
import { ForkBombProcessLimitClamp } from '../src/sandbox/fork_bomb_process_limit_clamp.js';

describe('ForkBombProcessLimitClamp Invariant Suite (#2059)', () => {
  it('correctly intercepts dangerous pattern', () => {
    const result = ForkBombProcessLimitClamp.inspect('rm -rf /production');
    expect(result.isThreat).toBe(true);
    expect(result.invariant).toBe('RULE_INVARIANT_FORK_BOMB_PROCESS_LIMIT_CLAMP');
    expect(ForkBombProcessLimitClamp.validate('rm -rf /production')).toBe(false);
  });

  it('permits verified safe engineering command', () => {
    const result = ForkBombProcessLimitClamp.inspect('git status && npm run test');
    expect(result.isThreat).toBe(false);
    expect(ForkBombProcessLimitClamp.validate('git status && npm run test')).toBe(true);
  });
});
