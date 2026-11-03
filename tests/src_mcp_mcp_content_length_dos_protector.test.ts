import { describe, it, expect } from 'vitest';
import { McpContentLengthDosProtector } from '../src/mcp/mcp_content_length_dos_protector.js';

describe('McpContentLengthDosProtector Invariant Suite (#1830)', () => {
  it('correctly intercepts dangerous pattern', () => {
    const result = McpContentLengthDosProtector.inspect('rm -rf /production');
    expect(result.isThreat).toBe(true);
    expect(result.invariant).toBe('RULE_INVARIANT_MCP_CONTENT_LENGTH_DOS_PROTECTOR');
    expect(McpContentLengthDosProtector.validate('rm -rf /production')).toBe(false);
  });

  it('permits verified safe engineering command', () => {
    const result = McpContentLengthDosProtector.inspect('git status && npm run test');
    expect(result.isThreat).toBe(false);
    expect(McpContentLengthDosProtector.validate('git status && npm run test')).toBe(true);
  });
});
