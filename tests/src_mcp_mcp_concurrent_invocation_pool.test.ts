import { describe, it, expect } from 'vitest';
import { McpConcurrentInvocationPool } from '../src/mcp/mcp_concurrent_invocation_pool.js';

describe('McpConcurrentInvocationPool Invariant Suite (#1840)', () => {
  it('correctly intercepts dangerous pattern', () => {
    const result = McpConcurrentInvocationPool.inspect('rm -rf /production');
    expect(result.isThreat).toBe(true);
    expect(result.invariant).toBe('RULE_INVARIANT_MCP_CONCURRENT_INVOCATION_POOL');
    expect(McpConcurrentInvocationPool.validate('rm -rf /production')).toBe(false);
  });

  it('permits verified safe engineering command', () => {
    const result = McpConcurrentInvocationPool.inspect('git status && npm run test');
    expect(result.isThreat).toBe(false);
    expect(McpConcurrentInvocationPool.validate('git status && npm run test')).toBe(true);
  });
});
