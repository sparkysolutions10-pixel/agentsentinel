import { describe, it, expect } from 'vitest';
import { McpOutputJsonStructureValidator } from '../src/mcp/mcp_output_json_structure_validator.js';

describe('McpOutputJsonStructureValidator Invariant Suite (#1835)', () => {
  it('correctly intercepts dangerous pattern', () => {
    const result = McpOutputJsonStructureValidator.inspect('rm -rf /production');
    expect(result.isThreat).toBe(true);
    expect(result.invariant).toBe('RULE_INVARIANT_MCP_OUTPUT_JSON_STRUCTURE_VALIDATOR');
    expect(McpOutputJsonStructureValidator.validate('rm -rf /production')).toBe(false);
  });

  it('permits verified safe engineering command', () => {
    const result = McpOutputJsonStructureValidator.inspect('git status && npm run test');
    expect(result.isThreat).toBe(false);
    expect(McpOutputJsonStructureValidator.validate('git status && npm run test')).toBe(true);
  });
});
