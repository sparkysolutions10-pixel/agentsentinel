import { describe, it, expect } from 'vitest';
import { McpPromptTemplateParameterEscape } from '../src/mcp/mcp_prompt_template_parameter_escape.js';

describe('McpPromptTemplateParameterEscape Invariant Suite (#1825)', () => {
  it('correctly intercepts dangerous pattern', () => {
    const result = McpPromptTemplateParameterEscape.inspect('rm -rf /production');
    expect(result.isThreat).toBe(true);
    expect(result.invariant).toBe('RULE_INVARIANT_MCP_PROMPT_TEMPLATE_PARAMETER_ESCAPE');
    expect(McpPromptTemplateParameterEscape.validate('rm -rf /production')).toBe(false);
  });

  it('permits verified safe engineering command', () => {
    const result = McpPromptTemplateParameterEscape.inspect('git status && npm run test');
    expect(result.isThreat).toBe(false);
    expect(McpPromptTemplateParameterEscape.validate('git status && npm run test')).toBe(true);
  });
});
