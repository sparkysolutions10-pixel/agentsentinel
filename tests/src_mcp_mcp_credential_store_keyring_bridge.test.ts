import { describe, it, expect } from 'vitest';
import { McpCredentialStoreKeyringBridge } from '../src/mcp/mcp_credential_store_keyring_bridge.js';

describe('McpCredentialStoreKeyringBridge Invariant Suite (#1839)', () => {
  it('correctly intercepts dangerous pattern', () => {
    const result = McpCredentialStoreKeyringBridge.inspect('rm -rf /production');
    expect(result.isThreat).toBe(true);
    expect(result.invariant).toBe('RULE_INVARIANT_MCP_CREDENTIAL_STORE_KEYRING_BRIDGE');
    expect(McpCredentialStoreKeyringBridge.validate('rm -rf /production')).toBe(false);
  });

  it('permits verified safe engineering command', () => {
    const result = McpCredentialStoreKeyringBridge.inspect('git status && npm run test');
    expect(result.isThreat).toBe(false);
    expect(McpCredentialStoreKeyringBridge.validate('git status && npm run test')).toBe(true);
  });
});
