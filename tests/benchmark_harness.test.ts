import { describe, it, expect } from 'vitest';
import {
  generateSyntheticPayloads,
  runBenchmarkHarness,
  formatBenchmarkReport,
} from '../src/benchmarks/harness.js';

describe('Benchmark Latency Harness (#119)', () => {
  it('generates diversified synthetic tool call payloads', () => {
    const payloads = generateSyntheticPayloads(80);
    expect(payloads).toHaveLength(80);

    const toolNames = new Set(payloads.map((p) => p.toolName));
    expect(toolNames.has('bash_exec')).toBe(true);
    expect(toolNames.has('execute_sql')).toBe(true);
    expect(toolNames.has('read_file')).toBe(true);
    expect(toolNames.has('api_call')).toBe(true);
    expect(toolNames.has('calculate_math')).toBe(true);
  });

  it('runs benchmark harness and computes accurate latency statistics under 2ms mean', async () => {
    const metrics = await runBenchmarkHarness({
      iterations: 500,
      warmupIterations: 50,
    });

    expect(metrics.totalIterations).toBe(500);
    expect(metrics.totalDurationMs).toBeGreaterThan(0);
    expect(metrics.opsPerSec).toBeGreaterThan(500);

    // Mean latency must adhere to high-performance SLA (< 2.0 ms)
    expect(metrics.meanLatencyMs).toBeLessThan(2.0);
    expect(metrics.medianLatencyMs).toBeGreaterThan(0);
    expect(metrics.p95LatencyMs).toBeGreaterThanOrEqual(metrics.medianLatencyMs);
    expect(metrics.p99LatencyMs).toBeGreaterThanOrEqual(metrics.p95LatencyMs);

    expect(metrics.allowCount + metrics.blockCount + metrics.redactCount).toBe(500);
    expect(metrics.blockCount).toBeGreaterThan(0);
    expect(metrics.allowCount).toBeGreaterThan(0);
  });

  it('formats benchmark metrics into an informative ASCII report', async () => {
    const sampleMetrics = {
      totalIterations: 10000,
      totalDurationMs: 1250.5,
      opsPerSec: 7996.8,
      meanLatencyMs: 0.125,
      medianLatencyMs: 0.110,
      p95LatencyMs: 0.280,
      p99LatencyMs: 0.450,
      minLatencyMs: 0.050,
      maxLatencyMs: 2.100,
      allowCount: 6250,
      blockCount: 2500,
      redactCount: 1250,
    };

    const report = formatBenchmarkReport(sampleMetrics);
    expect(report).toContain('AgentSentinel Benchmark Results (10,000 calls)');
    expect(report).toContain('7,997 ops/sec');
    expect(report).toContain('Mean Latency     : 0.1250 ms');
    expect(report).toContain('95th Percentile  : 0.2800 ms');
  });
});
