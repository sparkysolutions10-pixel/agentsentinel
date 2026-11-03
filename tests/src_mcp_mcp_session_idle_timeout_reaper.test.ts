import { describe, it, expect } from 'vitest';
import { McpSessionIdleTimeoutReaper } from '../src/mcp/mcp_session_idle_timeout_reaper.js';

describe('McpSessionIdleTimeoutReaper Invariant Suite (#1843)', () => {
  it('correctly intercepts dangerous pattern', () => {
    const result = McpSessionIdleTimeoutReaper.inspect('rm -rf /production');
    expect(result.isThreat).toBe(true);
    expect(result.invariant).toBe('RULE_INVARIANT_MCP_SESSION_IDLE_TIMEOUT_REAPER');
    expect(McpSessionIdleTimeoutReaper.validate('rm -rf /production')).toBe(false);
  });

  it('permits verified safe engineering command', () => {
    const result = McpSessionIdleTimeoutReaper.inspect('git status && npm run test');
    expect(result.isThreat).toBe(false);
    expect(McpSessionIdleTimeoutReaper.validate('git status && npm run test')).toBe(true);
  });
});
