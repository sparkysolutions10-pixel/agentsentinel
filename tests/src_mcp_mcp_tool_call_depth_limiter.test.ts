import { describe, it, expect } from 'vitest';
import { McpToolCallDepthLimiter } from '../src/mcp/mcp_tool_call_depth_limiter.js';

describe('McpToolCallDepthLimiter Invariant Suite (#1809)', () => {
  it('correctly intercepts dangerous pattern', () => {
    const result = McpToolCallDepthLimiter.inspect('rm -rf /production');
    expect(result.isThreat).toBe(true);
    expect(result.invariant).toBe('RULE_INVARIANT_MCP_TOOL_CALL_DEPTH_LIMITER');
    expect(McpToolCallDepthLimiter.validate('rm -rf /production')).toBe(false);
  });

  it('permits verified safe engineering command', () => {
    const result = McpToolCallDepthLimiter.inspect('git status && npm run test');
    expect(result.isThreat).toBe(false);
    expect(McpToolCallDepthLimiter.validate('git status && npm run test')).toBe(true);
  });
});
