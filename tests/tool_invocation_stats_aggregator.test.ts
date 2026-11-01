import { describe, it, expect } from 'vitest';
import { ToolInvocationStatsAggregator } from '../src/utils/tool_invocation_stats_aggregator.js';

describe('ToolInvocationStatsAggregator', () => {
  it('aggregates invocation calls and calculates averages', () => {
    const agg = new ToolInvocationStatsAggregator();
    agg.record('bash_exec', 100, false);
    agg.record('bash_exec', 200, true);

    const s = agg.getStats('bash_exec');
    expect(s?.calls).toBe(2);
    expect(s?.errors).toBe(1);
    expect(s?.totalDurationMs).toBe(300);
    expect(s?.avgDurationMs).toBe(150);
  });
});
