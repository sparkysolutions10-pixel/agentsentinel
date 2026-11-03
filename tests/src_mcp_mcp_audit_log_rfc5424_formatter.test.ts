import { describe, it, expect } from 'vitest';
import { McpAuditLogRfc5424Formatter } from '../src/mcp/mcp_audit_log_rfc5424_formatter.js';

describe('McpAuditLogRfc5424Formatter Invariant Suite (#1813)', () => {
  it('correctly intercepts dangerous pattern', () => {
    const result = McpAuditLogRfc5424Formatter.inspect('rm -rf /production');
    expect(result.isThreat).toBe(true);
    expect(result.invariant).toBe('RULE_INVARIANT_MCP_AUDIT_LOG_RFC5424_FORMATTER');
    expect(McpAuditLogRfc5424Formatter.validate('rm -rf /production')).toBe(false);
  });

  it('permits verified safe engineering command', () => {
    const result = McpAuditLogRfc5424Formatter.inspect('git status && npm run test');
    expect(result.isThreat).toBe(false);
    expect(McpAuditLogRfc5424Formatter.validate('git status && npm run test')).toBe(true);
  });
});
