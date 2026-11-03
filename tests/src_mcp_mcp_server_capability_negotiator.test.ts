import { describe, it, expect } from 'vitest';
import { McpServerCapabilityNegotiator } from '../src/mcp/mcp_server_capability_negotiator.js';

describe('McpServerCapabilityNegotiator Invariant Suite (#1812)', () => {
  it('correctly intercepts dangerous pattern', () => {
    const result = McpServerCapabilityNegotiator.inspect('rm -rf /production');
    expect(result.isThreat).toBe(true);
    expect(result.invariant).toBe('RULE_INVARIANT_MCP_SERVER_CAPABILITY_NEGOTIATOR');
    expect(McpServerCapabilityNegotiator.validate('rm -rf /production')).toBe(false);
  });

  it('permits verified safe engineering command', () => {
    const result = McpServerCapabilityNegotiator.inspect('git status && npm run test');
    expect(result.isThreat).toBe(false);
    expect(McpServerCapabilityNegotiator.validate('git status && npm run test')).toBe(true);
  });
});
