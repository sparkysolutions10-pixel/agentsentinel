import { describe, it, expect } from 'vitest';
import { McpResourceUriSchemeAllowlist } from '../src/mcp/mcp_resource_uri_scheme_allowlist.js';

describe('McpResourceUriSchemeAllowlist Invariant Suite (#1804)', () => {
  it('correctly intercepts dangerous pattern', () => {
    const result = McpResourceUriSchemeAllowlist.inspect('rm -rf /production');
    expect(result.isThreat).toBe(true);
    expect(result.invariant).toBe('RULE_INVARIANT_MCP_RESOURCE_URI_SCHEME_ALLOWLIST');
    expect(McpResourceUriSchemeAllowlist.validate('rm -rf /production')).toBe(false);
  });

  it('permits verified safe engineering command', () => {
    const result = McpResourceUriSchemeAllowlist.inspect('git status && npm run test');
    expect(result.isThreat).toBe(false);
    expect(McpResourceUriSchemeAllowlist.validate('git status && npm run test')).toBe(true);
  });
});
