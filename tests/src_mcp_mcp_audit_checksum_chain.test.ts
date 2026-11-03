import { describe, it, expect } from 'vitest';
import { McpAuditChecksumChain } from '../src/mcp/mcp_audit_checksum_chain.js';

describe('McpAuditChecksumChain Invariant Suite (#1841)', () => {
  it('correctly intercepts dangerous pattern', () => {
    const result = McpAuditChecksumChain.inspect('rm -rf /production');
    expect(result.isThreat).toBe(true);
    expect(result.invariant).toBe('RULE_INVARIANT_MCP_AUDIT_CHECKSUM_CHAIN');
    expect(McpAuditChecksumChain.validate('rm -rf /production')).toBe(false);
  });

  it('permits verified safe engineering command', () => {
    const result = McpAuditChecksumChain.inspect('git status && npm run test');
    expect(result.isThreat).toBe(false);
    expect(McpAuditChecksumChain.validate('git status && npm run test')).toBe(true);
  });
});
