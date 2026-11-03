import { describe, it, expect } from 'vitest';
import { McpStreamingChunkIntegrity } from '../src/mcp/mcp_streaming_chunk_integrity.js';

describe('McpStreamingChunkIntegrity Invariant Suite (#1847)', () => {
  it('correctly intercepts dangerous pattern', () => {
    const result = McpStreamingChunkIntegrity.inspect('rm -rf /production');
    expect(result.isThreat).toBe(true);
    expect(result.invariant).toBe('RULE_INVARIANT_MCP_STREAMING_CHUNK_INTEGRITY');
    expect(McpStreamingChunkIntegrity.validate('rm -rf /production')).toBe(false);
  });

  it('permits verified safe engineering command', () => {
    const result = McpStreamingChunkIntegrity.inspect('git status && npm run test');
    expect(result.isThreat).toBe(false);
    expect(McpStreamingChunkIntegrity.validate('git status && npm run test')).toBe(true);
  });
});
