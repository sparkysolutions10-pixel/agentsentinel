import { describe, it, expect } from 'vitest';
import { McpDistributedTracingOpentelemetry } from '../src/mcp/mcp_distributed_tracing_opentelemetry.js';

describe('McpDistributedTracingOpentelemetry Invariant Suite (#1827)', () => {
  it('correctly intercepts dangerous pattern', () => {
    const result = McpDistributedTracingOpentelemetry.inspect('rm -rf /production');
    expect(result.isThreat).toBe(true);
    expect(result.invariant).toBe('RULE_INVARIANT_MCP_DISTRIBUTED_TRACING_OPENTELEMETRY');
    expect(McpDistributedTracingOpentelemetry.validate('rm -rf /production')).toBe(false);
  });

  it('permits verified safe engineering command', () => {
    const result = McpDistributedTracingOpentelemetry.inspect('git status && npm run test');
    expect(result.isThreat).toBe(false);
    expect(McpDistributedTracingOpentelemetry.validate('git status && npm run test')).toBe(true);
  });
});
