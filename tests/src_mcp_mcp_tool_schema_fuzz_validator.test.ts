import { describe, it, expect } from 'vitest';
import { McpToolSchemaFuzzValidator } from '../src/mcp/mcp_tool_schema_fuzz_validator.js';

describe('McpToolSchemaFuzzValidator Invariant Suite (#1805)', () => {
  it('correctly intercepts dangerous pattern', () => {
    const result = McpToolSchemaFuzzValidator.inspect('rm -rf /production');
    expect(result.isThreat).toBe(true);
    expect(result.invariant).toBe('RULE_INVARIANT_MCP_TOOL_SCHEMA_FUZZ_VALIDATOR');
    expect(McpToolSchemaFuzzValidator.validate('rm -rf /production')).toBe(false);
  });

  it('permits verified safe engineering command', () => {
    const result = McpToolSchemaFuzzValidator.inspect('git status && npm run test');
    expect(result.isThreat).toBe(false);
    expect(McpToolSchemaFuzzValidator.validate('git status && npm run test')).toBe(true);
  });
});
