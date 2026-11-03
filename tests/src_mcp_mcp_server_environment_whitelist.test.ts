import { describe, it, expect } from 'vitest';
import { McpServerEnvironmentWhitelist } from '../src/mcp/mcp_server_environment_whitelist.js';

describe('McpServerEnvironmentWhitelist Invariant Suite (#1842)', () => {
  it('correctly intercepts dangerous pattern', () => {
    const result = McpServerEnvironmentWhitelist.inspect('rm -rf /production');
    expect(result.isThreat).toBe(true);
    expect(result.invariant).toBe('RULE_INVARIANT_MCP_SERVER_ENVIRONMENT_WHITELIST');
    expect(McpServerEnvironmentWhitelist.validate('rm -rf /production')).toBe(false);
  });

  it('permits verified safe engineering command', () => {
    const result = McpServerEnvironmentWhitelist.inspect('git status && npm run test');
    expect(result.isThreat).toBe(false);
    expect(McpServerEnvironmentWhitelist.validate('git status && npm run test')).toBe(true);
  });
});
