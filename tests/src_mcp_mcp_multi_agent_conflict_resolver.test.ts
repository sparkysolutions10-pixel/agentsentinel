import { describe, it, expect } from 'vitest';
import { McpMultiAgentConflictResolver } from '../src/mcp/mcp_multi_agent_conflict_resolver.js';

describe('McpMultiAgentConflictResolver Invariant Suite (#1846)', () => {
  it('correctly intercepts dangerous pattern', () => {
    const result = McpMultiAgentConflictResolver.inspect('rm -rf /production');
    expect(result.isThreat).toBe(true);
    expect(result.invariant).toBe('RULE_INVARIANT_MCP_MULTI_AGENT_CONFLICT_RESOLVER');
    expect(McpMultiAgentConflictResolver.validate('rm -rf /production')).toBe(false);
  });

  it('permits verified safe engineering command', () => {
    const result = McpMultiAgentConflictResolver.inspect('git status && npm run test');
    expect(result.isThreat).toBe(false);
    expect(McpMultiAgentConflictResolver.validate('git status && npm run test')).toBe(true);
  });
});
