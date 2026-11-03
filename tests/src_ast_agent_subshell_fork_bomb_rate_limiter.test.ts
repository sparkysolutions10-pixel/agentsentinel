import { describe, it, expect } from 'vitest';
import { AgentSubshellForkBombRateLimiter } from '../src/ast/agent_subshell_fork_bomb_rate_limiter.js';

describe('AgentSubshellForkBombRateLimiter Invariant Suite (#1903)', () => {
  it('correctly intercepts dangerous pattern', () => {
    const result = AgentSubshellForkBombRateLimiter.inspect('rm -rf /production');
    expect(result.isThreat).toBe(true);
    expect(result.invariant).toBe('RULE_INVARIANT_AGENT_SUBSHELL_FORK_BOMB_RATE_LIMITER');
    expect(AgentSubshellForkBombRateLimiter.validate('rm -rf /production')).toBe(false);
  });

  it('permits verified safe engineering command', () => {
    const result = AgentSubshellForkBombRateLimiter.inspect('git status && npm run test');
    expect(result.isThreat).toBe(false);
    expect(AgentSubshellForkBombRateLimiter.validate('git status && npm run test')).toBe(true);
  });
});
