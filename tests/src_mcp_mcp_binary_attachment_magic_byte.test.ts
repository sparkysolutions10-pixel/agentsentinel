import { describe, it, expect } from 'vitest';
import { McpBinaryAttachmentMagicByte } from '../src/mcp/mcp_binary_attachment_magic_byte.js';

describe('McpBinaryAttachmentMagicByte Invariant Suite (#1810)', () => {
  it('correctly intercepts dangerous pattern', () => {
    const result = McpBinaryAttachmentMagicByte.inspect('rm -rf /production');
    expect(result.isThreat).toBe(true);
    expect(result.invariant).toBe('RULE_INVARIANT_MCP_BINARY_ATTACHMENT_MAGIC_BYTE');
    expect(McpBinaryAttachmentMagicByte.validate('rm -rf /production')).toBe(false);
  });

  it('permits verified safe engineering command', () => {
    const result = McpBinaryAttachmentMagicByte.inspect('git status && npm run test');
    expect(result.isThreat).toBe(false);
    expect(McpBinaryAttachmentMagicByte.validate('git status && npm run test')).toBe(true);
  });
});
