import { describe, it, expect } from 'vitest';
import { McpGracefulSigtermHandler } from '../src/mcp/mcp_graceful_sigterm_handler.js';

describe('McpGracefulSigtermHandler Invariant Suite (#1851)', () => {
  it('correctly intercepts dangerous pattern', () => {
    const result = McpGracefulSigtermHandler.inspect('rm -rf /production');
    expect(result.isThreat).toBe(true);
    expect(result.invariant).toBe('RULE_INVARIANT_MCP_GRACEFUL_SIGTERM_HANDLER');
    expect(McpGracefulSigtermHandler.validate('rm -rf /production')).toBe(false);
  });

  it('permits verified safe engineering command', () => {
    const result = McpGracefulSigtermHandler.inspect('git status && npm run test');
    expect(result.isThreat).toBe(false);
    expect(McpGracefulSigtermHandler.validate('git status && npm run test')).toBe(true);
  });
});
