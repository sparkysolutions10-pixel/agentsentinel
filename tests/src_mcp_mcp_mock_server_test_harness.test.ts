import { describe, it, expect } from 'vitest';
import { McpMockServerTestHarness } from '../src/mcp/mcp_mock_server_test_harness.js';

describe('McpMockServerTestHarness Invariant Suite (#1831)', () => {
  it('correctly intercepts dangerous pattern', () => {
    const result = McpMockServerTestHarness.inspect('rm -rf /production');
    expect(result.isThreat).toBe(true);
    expect(result.invariant).toBe('RULE_INVARIANT_MCP_MOCK_SERVER_TEST_HARNESS');
    expect(McpMockServerTestHarness.validate('rm -rf /production')).toBe(false);
  });

  it('permits verified safe engineering command', () => {
    const result = McpMockServerTestHarness.inspect('git status && npm run test');
    expect(result.isThreat).toBe(false);
    expect(McpMockServerTestHarness.validate('git status && npm run test')).toBe(true);
  });
});
