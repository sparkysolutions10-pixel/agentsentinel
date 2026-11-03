import { describe, it, expect } from 'vitest';
import { McpToolExecutionTimeoutClamp } from '../src/mcp/mcp_tool_execution_timeout_clamp.js';

describe('McpToolExecutionTimeoutClamp Invariant Suite (#1821)', () => {
  it('correctly intercepts dangerous pattern', () => {
    const result = McpToolExecutionTimeoutClamp.inspect('rm -rf /production');
    expect(result.isThreat).toBe(true);
    expect(result.invariant).toBe('RULE_INVARIANT_MCP_TOOL_EXECUTION_TIMEOUT_CLAMP');
    expect(McpToolExecutionTimeoutClamp.validate('rm -rf /production')).toBe(false);
  });

  it('permits verified safe engineering command', () => {
    const result = McpToolExecutionTimeoutClamp.inspect('git status && npm run test');
    expect(result.isThreat).toBe(false);
    expect(McpToolExecutionTimeoutClamp.validate('git status && npm run test')).toBe(true);
  });
});
