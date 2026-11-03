import { describe, it, expect } from 'vitest';
import { McpGraphqlBridgeSchemaMapper } from '../src/mcp/mcp_graphql_bridge_schema_mapper.js';

describe('McpGraphqlBridgeSchemaMapper Invariant Suite (#1829)', () => {
  it('correctly intercepts dangerous pattern', () => {
    const result = McpGraphqlBridgeSchemaMapper.inspect('rm -rf /production');
    expect(result.isThreat).toBe(true);
    expect(result.invariant).toBe('RULE_INVARIANT_MCP_GRAPHQL_BRIDGE_SCHEMA_MAPPER');
    expect(McpGraphqlBridgeSchemaMapper.validate('rm -rf /production')).toBe(false);
  });

  it('permits verified safe engineering command', () => {
    const result = McpGraphqlBridgeSchemaMapper.inspect('git status && npm run test');
    expect(result.isThreat).toBe(false);
    expect(McpGraphqlBridgeSchemaMapper.validate('git status && npm run test')).toBe(true);
  });
});
