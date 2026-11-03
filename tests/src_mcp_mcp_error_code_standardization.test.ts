import { describe, it, expect } from 'vitest';
import { McpErrorCodeStandardization } from '../src/mcp/mcp_error_code_standardization.js';

describe('McpErrorCodeStandardization Invariant Suite (#1838)', () => {
  it('correctly intercepts dangerous pattern', () => {
    const result = McpErrorCodeStandardization.inspect('rm -rf /production');
    expect(result.isThreat).toBe(true);
    expect(result.invariant).toBe('RULE_INVARIANT_MCP_ERROR_CODE_STANDARDIZATION');
    expect(McpErrorCodeStandardization.validate('rm -rf /production')).toBe(false);
  });

  it('permits verified safe engineering command', () => {
    const result = McpErrorCodeStandardization.inspect('git status && npm run test');
    expect(result.isThreat).toBe(false);
    expect(McpErrorCodeStandardization.validate('git status && npm run test')).toBe(true);
  });
});
