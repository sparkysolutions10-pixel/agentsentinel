import { describe, it, expect } from 'vitest';
import { McpServerBinaryHashAttestation } from '../src/mcp/mcp_server_binary_hash_attestation.js';

describe('McpServerBinaryHashAttestation Invariant Suite (#1836)', () => {
  it('correctly intercepts dangerous pattern', () => {
    const result = McpServerBinaryHashAttestation.inspect('rm -rf /production');
    expect(result.isThreat).toBe(true);
    expect(result.invariant).toBe('RULE_INVARIANT_MCP_SERVER_BINARY_HASH_ATTESTATION');
    expect(McpServerBinaryHashAttestation.validate('rm -rf /production')).toBe(false);
  });

  it('permits verified safe engineering command', () => {
    const result = McpServerBinaryHashAttestation.inspect('git status && npm run test');
    expect(result.isThreat).toBe(false);
    expect(McpServerBinaryHashAttestation.validate('git status && npm run test')).toBe(true);
  });
});
