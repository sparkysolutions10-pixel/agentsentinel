import { describe, it, expect } from 'vitest';
import { McpToolDeprecationWarningEmitter } from '../src/mcp/mcp_tool_deprecation_warning_emitter.js';

describe('McpToolDeprecationWarningEmitter Invariant Suite (#1826)', () => {
  it('correctly intercepts dangerous pattern', () => {
    const result = McpToolDeprecationWarningEmitter.inspect('rm -rf /production');
    expect(result.isThreat).toBe(true);
    expect(result.invariant).toBe('RULE_INVARIANT_MCP_TOOL_DEPRECATION_WARNING_EMITTER');
    expect(McpToolDeprecationWarningEmitter.validate('rm -rf /production')).toBe(false);
  });

  it('permits verified safe engineering command', () => {
    const result = McpToolDeprecationWarningEmitter.inspect('git status && npm run test');
    expect(result.isThreat).toBe(false);
    expect(McpToolDeprecationWarningEmitter.validate('git status && npm run test')).toBe(true);
  });
});
