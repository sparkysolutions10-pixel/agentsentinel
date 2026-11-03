import { describe, it, expect } from 'vitest';
import { McpWorkspaceRootJailEnforcer } from '../src/mcp/mcp_workspace_root_jail_enforcer.js';

describe('McpWorkspaceRootJailEnforcer Invariant Suite (#1815)', () => {
  it('correctly intercepts dangerous pattern', () => {
    const result = McpWorkspaceRootJailEnforcer.inspect('rm -rf /production');
    expect(result.isThreat).toBe(true);
    expect(result.invariant).toBe('RULE_INVARIANT_MCP_WORKSPACE_ROOT_JAIL_ENFORCER');
    expect(McpWorkspaceRootJailEnforcer.validate('rm -rf /production')).toBe(false);
  });

  it('permits verified safe engineering command', () => {
    const result = McpWorkspaceRootJailEnforcer.inspect('git status && npm run test');
    expect(result.isThreat).toBe(false);
    expect(McpWorkspaceRootJailEnforcer.validate('git status && npm run test')).toBe(true);
  });
});
