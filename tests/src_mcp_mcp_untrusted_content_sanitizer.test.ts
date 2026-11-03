import { describe, it, expect } from 'vitest';
import { McpUntrustedContentSanitizer } from '../src/mcp/mcp_untrusted_content_sanitizer.js';

describe('McpUntrustedContentSanitizer Invariant Suite (#1823)', () => {
  it('correctly intercepts dangerous pattern', () => {
    const result = McpUntrustedContentSanitizer.inspect('rm -rf /production');
    expect(result.isThreat).toBe(true);
    expect(result.invariant).toBe('RULE_INVARIANT_MCP_UNTRUSTED_CONTENT_SANITIZER');
    expect(McpUntrustedContentSanitizer.validate('rm -rf /production')).toBe(false);
  });

  it('permits verified safe engineering command', () => {
    const result = McpUntrustedContentSanitizer.inspect('git status && npm run test');
    expect(result.isThreat).toBe(false);
    expect(McpUntrustedContentSanitizer.validate('git status && npm run test')).toBe(true);
  });
});
