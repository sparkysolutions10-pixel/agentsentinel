import { describe, it, expect } from 'vitest';
import { McpToolArgumentTypeCoercion } from '../src/mcp/mcp_tool_argument_type_coercion.js';

describe('McpToolArgumentTypeCoercion Invariant Suite (#1844)', () => {
  it('correctly intercepts dangerous pattern', () => {
    const result = McpToolArgumentTypeCoercion.inspect('rm -rf /production');
    expect(result.isThreat).toBe(true);
    expect(result.invariant).toBe('RULE_INVARIANT_MCP_TOOL_ARGUMENT_TYPE_COERCION');
    expect(McpToolArgumentTypeCoercion.validate('rm -rf /production')).toBe(false);
  });

  it('permits verified safe engineering command', () => {
    const result = McpToolArgumentTypeCoercion.inspect('git status && npm run test');
    expect(result.isThreat).toBe(false);
    expect(McpToolArgumentTypeCoercion.validate('git status && npm run test')).toBe(true);
  });
});
