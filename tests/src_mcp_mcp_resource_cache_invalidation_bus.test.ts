import { describe, it, expect } from 'vitest';
import { McpResourceCacheInvalidationBus } from '../src/mcp/mcp_resource_cache_invalidation_bus.js';

describe('McpResourceCacheInvalidationBus Invariant Suite (#1822)', () => {
  it('correctly intercepts dangerous pattern', () => {
    const result = McpResourceCacheInvalidationBus.inspect('rm -rf /production');
    expect(result.isThreat).toBe(true);
    expect(result.invariant).toBe('RULE_INVARIANT_MCP_RESOURCE_CACHE_INVALIDATION_BUS');
    expect(McpResourceCacheInvalidationBus.validate('rm -rf /production')).toBe(false);
  });

  it('permits verified safe engineering command', () => {
    const result = McpResourceCacheInvalidationBus.inspect('git status && npm run test');
    expect(result.isThreat).toBe(false);
    expect(McpResourceCacheInvalidationBus.validate('git status && npm run test')).toBe(true);
  });
});
