import { describe, it, expect } from 'vitest';
import { McpDynamicToolRegistrationLock } from '../src/mcp/mcp_dynamic_tool_registration_lock.js';

describe('McpDynamicToolRegistrationLock Invariant Suite (#1832)', () => {
  it('correctly intercepts dangerous pattern', () => {
    const result = McpDynamicToolRegistrationLock.inspect('rm -rf /production');
    expect(result.isThreat).toBe(true);
    expect(result.invariant).toBe('RULE_INVARIANT_MCP_DYNAMIC_TOOL_REGISTRATION_LOCK');
    expect(McpDynamicToolRegistrationLock.validate('rm -rf /production')).toBe(false);
  });

  it('permits verified safe engineering command', () => {
    const result = McpDynamicToolRegistrationLock.inspect('git status && npm run test');
    expect(result.isThreat).toBe(false);
    expect(McpDynamicToolRegistrationLock.validate('git status && npm run test')).toBe(true);
  });
});
