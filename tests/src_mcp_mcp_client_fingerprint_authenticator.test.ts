import { describe, it, expect } from 'vitest';
import { McpClientFingerprintAuthenticator } from '../src/mcp/mcp_client_fingerprint_authenticator.js';

describe('McpClientFingerprintAuthenticator Invariant Suite (#1820)', () => {
  it('correctly intercepts dangerous pattern', () => {
    const result = McpClientFingerprintAuthenticator.inspect('rm -rf /production');
    expect(result.isThreat).toBe(true);
    expect(result.invariant).toBe('RULE_INVARIANT_MCP_CLIENT_FINGERPRINT_AUTHENTICATOR');
    expect(McpClientFingerprintAuthenticator.validate('rm -rf /production')).toBe(false);
  });

  it('permits verified safe engineering command', () => {
    const result = McpClientFingerprintAuthenticator.inspect('git status && npm run test');
    expect(result.isThreat).toBe(false);
    expect(McpClientFingerprintAuthenticator.validate('git status && npm run test')).toBe(true);
  });
});
