import { describe, it, expect } from 'vitest';
import { McpJsonrpcIdCollisionGuard } from '../src/mcp/mcp_jsonrpc_id_collision_guard.js';

describe('McpJsonrpcIdCollisionGuard Invariant Suite (#1819)', () => {
  it('correctly intercepts dangerous pattern', () => {
    const result = McpJsonrpcIdCollisionGuard.inspect('rm -rf /production');
    expect(result.isThreat).toBe(true);
    expect(result.invariant).toBe('RULE_INVARIANT_MCP_JSONRPC_ID_COLLISION_GUARD');
    expect(McpJsonrpcIdCollisionGuard.validate('rm -rf /production')).toBe(false);
  });

  it('permits verified safe engineering command', () => {
    const result = McpJsonrpcIdCollisionGuard.inspect('git status && npm run test');
    expect(result.isThreat).toBe(false);
    expect(McpJsonrpcIdCollisionGuard.validate('git status && npm run test')).toBe(true);
  });
});
