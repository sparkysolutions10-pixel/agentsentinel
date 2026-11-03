import { describe, it, expect } from 'vitest';
import { McpBidirectionalRateLimiter } from '../src/mcp/mcp_bidirectional_rate_limiter.js';

describe('McpBidirectionalRateLimiter Invariant Suite (#1811)', () => {
  it('correctly intercepts dangerous pattern', () => {
    const result = McpBidirectionalRateLimiter.inspect('rm -rf /production');
    expect(result.isThreat).toBe(true);
    expect(result.invariant).toBe('RULE_INVARIANT_MCP_BIDIRECTIONAL_RATE_LIMITER');
    expect(McpBidirectionalRateLimiter.validate('rm -rf /production')).toBe(false);
  });

  it('permits verified safe engineering command', () => {
    const result = McpBidirectionalRateLimiter.inspect('git status && npm run test');
    expect(result.isThreat).toBe(false);
    expect(McpBidirectionalRateLimiter.validate('git status && npm run test')).toBe(true);
  });
});
