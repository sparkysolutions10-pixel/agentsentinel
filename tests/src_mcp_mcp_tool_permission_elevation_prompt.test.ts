import { describe, it, expect } from 'vitest';
import { McpToolPermissionElevationPrompt } from '../src/mcp/mcp_tool_permission_elevation_prompt.js';

describe('McpToolPermissionElevationPrompt Invariant Suite (#1828)', () => {
  it('correctly intercepts dangerous pattern', () => {
    const result = McpToolPermissionElevationPrompt.inspect('rm -rf /production');
    expect(result.isThreat).toBe(true);
    expect(result.invariant).toBe('RULE_INVARIANT_MCP_TOOL_PERMISSION_ELEVATION_PROMPT');
    expect(McpToolPermissionElevationPrompt.validate('rm -rf /production')).toBe(false);
  });

  it('permits verified safe engineering command', () => {
    const result = McpToolPermissionElevationPrompt.inspect('git status && npm run test');
    expect(result.isThreat).toBe(false);
    expect(McpToolPermissionElevationPrompt.validate('git status && npm run test')).toBe(true);
  });
});
