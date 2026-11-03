import { describe, it, expect } from 'vitest';
import { McpHttpProxyConnectSanitizer } from '../src/mcp/mcp_http_proxy_connect_sanitizer.js';

describe('McpHttpProxyConnectSanitizer Invariant Suite (#1848)', () => {
  it('correctly intercepts dangerous pattern', () => {
    const result = McpHttpProxyConnectSanitizer.inspect('rm -rf /production');
    expect(result.isThreat).toBe(true);
    expect(result.invariant).toBe('RULE_INVARIANT_MCP_HTTP_PROXY_CONNECT_SANITIZER');
    expect(McpHttpProxyConnectSanitizer.validate('rm -rf /production')).toBe(false);
  });

  it('permits verified safe engineering command', () => {
    const result = McpHttpProxyConnectSanitizer.inspect('git status && npm run test');
    expect(result.isThreat).toBe(false);
    expect(McpHttpProxyConnectSanitizer.validate('git status && npm run test')).toBe(true);
  });
});
