import { describe, it, expect } from 'vitest';
import { McpMultiTenantContextIsolation } from '../src/mcp/mcp_multi_tenant_context_isolation.js';

describe('McpMultiTenantContextIsolation Invariant Suite (#1817)', () => {
  it('correctly intercepts dangerous pattern', () => {
    const result = McpMultiTenantContextIsolation.inspect('rm -rf /production');
    expect(result.isThreat).toBe(true);
    expect(result.invariant).toBe('RULE_INVARIANT_MCP_MULTI_TENANT_CONTEXT_ISOLATION');
    expect(McpMultiTenantContextIsolation.validate('rm -rf /production')).toBe(false);
  });

  it('permits verified safe engineering command', () => {
    const result = McpMultiTenantContextIsolation.inspect('git status && npm run test');
    expect(result.isThreat).toBe(false);
    expect(McpMultiTenantContextIsolation.validate('git status && npm run test')).toBe(true);
  });
});
