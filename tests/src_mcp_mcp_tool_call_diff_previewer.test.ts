import { describe, it, expect } from 'vitest';
import { McpToolCallDiffPreviewer } from '../src/mcp/mcp_tool_call_diff_previewer.js';

describe('McpToolCallDiffPreviewer Invariant Suite (#1852)', () => {
  it('correctly intercepts dangerous pattern', () => {
    const result = McpToolCallDiffPreviewer.inspect('rm -rf /production');
    expect(result.isThreat).toBe(true);
    expect(result.invariant).toBe('RULE_INVARIANT_MCP_TOOL_CALL_DIFF_PREVIEWER');
    expect(McpToolCallDiffPreviewer.validate('rm -rf /production')).toBe(false);
  });

  it('permits verified safe engineering command', () => {
    const result = McpToolCallDiffPreviewer.inspect('git status && npm run test');
    expect(result.isThreat).toBe(false);
    expect(McpToolCallDiffPreviewer.validate('git status && npm run test')).toBe(true);
  });
});
