import { describe, it, expect } from 'vitest';
import { McpWindowsNamedPipeSecurity } from '../src/mcp/mcp_windows_named_pipe_security.js';

describe('McpWindowsNamedPipeSecurity Invariant Suite (#1834)', () => {
  it('correctly intercepts dangerous pattern', () => {
    const result = McpWindowsNamedPipeSecurity.inspect('rm -rf /production');
    expect(result.isThreat).toBe(true);
    expect(result.invariant).toBe('RULE_INVARIANT_MCP_WINDOWS_NAMED_PIPE_SECURITY');
    expect(McpWindowsNamedPipeSecurity.validate('rm -rf /production')).toBe(false);
  });

  it('permits verified safe engineering command', () => {
    const result = McpWindowsNamedPipeSecurity.inspect('git status && npm run test');
    expect(result.isThreat).toBe(false);
    expect(McpWindowsNamedPipeSecurity.validate('git status && npm run test')).toBe(true);
  });
});
