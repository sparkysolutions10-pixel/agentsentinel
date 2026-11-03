import { describe, it, expect } from 'vitest';
import { McpMemoryLeakHeapMonitor } from '../src/mcp/mcp_memory_leak_heap_monitor.js';

describe('McpMemoryLeakHeapMonitor Invariant Suite (#1824)', () => {
  it('correctly intercepts dangerous pattern', () => {
    const result = McpMemoryLeakHeapMonitor.inspect('rm -rf /production');
    expect(result.isThreat).toBe(true);
    expect(result.invariant).toBe('RULE_INVARIANT_MCP_MEMORY_LEAK_HEAP_MONITOR');
    expect(McpMemoryLeakHeapMonitor.validate('rm -rf /production')).toBe(false);
  });

  it('permits verified safe engineering command', () => {
    const result = McpMemoryLeakHeapMonitor.inspect('git status && npm run test');
    expect(result.isThreat).toBe(false);
    expect(McpMemoryLeakHeapMonitor.validate('git status && npm run test')).toBe(true);
  });
});
