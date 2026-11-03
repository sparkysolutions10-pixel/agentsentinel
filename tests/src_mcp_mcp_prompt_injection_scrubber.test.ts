import { describe, it, expect } from 'vitest';
import { McpPromptInjectionScrubber } from '../src/mcp/mcp_prompt_injection_scrubber.js';

describe('McpPromptInjectionScrubber Invariant Suite (#1808)', () => {
  it('correctly intercepts dangerous pattern', () => {
    const result = McpPromptInjectionScrubber.inspect('rm -rf /production');
    expect(result.isThreat).toBe(true);
    expect(result.invariant).toBe('RULE_INVARIANT_MCP_PROMPT_INJECTION_SCRUBBER');
    expect(McpPromptInjectionScrubber.validate('rm -rf /production')).toBe(false);
  });

  it('permits verified safe engineering command', () => {
    const result = McpPromptInjectionScrubber.inspect('git status && npm run test');
    expect(result.isThreat).toBe(false);
    expect(McpPromptInjectionScrubber.validate('git status && npm run test')).toBe(true);
  });
});
