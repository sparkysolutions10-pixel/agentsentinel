import { describe, it, expect } from 'vitest';
import { ToolDurationHistogram } from '../src/utils/tool_duration_histogram.js';

describe('ToolDurationHistogram', () => {
  it('records durations and calculates percentiles correctly', () => {
    const hist = new ToolDurationHistogram();
    for (let i = 1; i <= 100; i++) {
      hist.record('query_sql', i);
    }

    const stats = hist.getStats('query_sql');
    expect(stats?.count).toBe(100);
    expect(stats?.min).toBe(1);
    expect(stats?.max).toBe(100);
    expect(stats?.avg).toBe(50.5);
    expect(stats?.p50).toBe(50);
    expect(stats?.p90).toBe(90);
    expect(stats?.p95).toBe(95);
    expect(stats?.p99).toBe(99);
  });

  it('returns null when querying unrecorded tool', () => {
    const hist = new ToolDurationHistogram();
    expect(hist.getStats('missing_tool')).toBeNull();
  });

  it('handles multiple tools independently', () => {
    const hist = new ToolDurationHistogram();
    hist.record('fetch_url', 10);
    hist.record('fetch_url', 30);
    hist.record('write_file', 5);

    const all = hist.getAllStats();
    expect(all.fetch_url.count).toBe(2);
    expect(all.fetch_url.avg).toBe(20);
    expect(all.write_file.count).toBe(1);
  });
});
