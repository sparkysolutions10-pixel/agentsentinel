import { describe, it, expect } from 'vitest';
import { McpSseTransportTokenRotation } from '../src/mcp/mcp_sse_transport_token_rotation.js';

describe('McpSseTransportTokenRotation Invariant Suite (#1807)', () => {
  it('correctly intercepts dangerous pattern', () => {
    const result = McpSseTransportTokenRotation.inspect('rm -rf /production');
    expect(result.isThreat).toBe(true);
    expect(result.invariant).toBe('RULE_INVARIANT_MCP_SSE_TRANSPORT_TOKEN_ROTATION');
    expect(McpSseTransportTokenRotation.validate('rm -rf /production')).toBe(false);
  });

  it('permits verified safe engineering command', () => {
    const result = McpSseTransportTokenRotation.inspect('git status && npm run test');
    expect(result.isThreat).toBe(false);
    expect(McpSseTransportTokenRotation.validate('git status && npm run test')).toBe(true);
  });
});
