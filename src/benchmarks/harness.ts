/**
 * AgentSentinel High-Performance Latency Benchmark Harness.
 * Measures nanosecond/microsecond execution overhead across 10,000+ synthetic tool calls
 * calculating mean, median, p95, p99 percentiles, and ops/second throughput.
 */

import { SentinelEngine } from '../index.js';
import { ToolCallContext, Verdict } from '../types.js';
import { createDefaultCliEngine } from '../cli/runner.js';

export interface BenchmarkOptions {
  iterations?: number;
  engine?: SentinelEngine;
  warmupIterations?: number;
  includeBuiltinRules?: boolean;
}

export interface BenchmarkMetrics {
  totalIterations: number;
  totalDurationMs: number;
  opsPerSec: number;
  meanLatencyMs: number;
  medianLatencyMs: number;
  p95LatencyMs: number;
  p99LatencyMs: number;
  minLatencyMs: number;
  maxLatencyMs: number;
  allowCount: number;
  blockCount: number;
  redactCount: number;
}

/**
 * Generates an array of diversified synthetic tool calls mimicking real agent workloads.
 */
export function generateSyntheticPayloads(count: number): ToolCallContext[] {
  const payloads: ToolCallContext[] = [];

  const templates: Array<(idx: number) => ToolCallContext> = [
    // 1. Safe shell
    (i) => ({
      id: `bench-shell-safe-${i}`,
      toolName: 'bash_exec',
      category: 'shell',
      params: { command: `echo "Processing batch item ${i}" && ls -la /tmp` },
      timestamp: Date.now(),
    }),
    // 2. Prohibited shell (rm -rf)
    (i) => ({
      id: `bench-shell-block-${i}`,
      toolName: 'bash_exec',
      category: 'shell',
      params: { command: `rm -rf / --no-preserve-root` },
      timestamp: Date.now(),
    }),
    // 3. Safe SQL query
    (i) => ({
      id: `bench-sql-safe-${i}`,
      toolName: 'execute_sql',
      category: 'sql',
      params: { query: `SELECT user_id, email, status FROM accounts WHERE tenant_id = ${i} LIMIT 10;` },
      timestamp: Date.now(),
    }),
    // 4. Prohibited SQL drop
    (i) => ({
      id: `bench-sql-drop-${i}`,
      toolName: 'execute_sql',
      category: 'sql',
      params: { query: `DROP TABLE users;` },
      timestamp: Date.now(),
    }),
    // 5. Sensitive FS path traversal
    (i) => ({
      id: `bench-fs-traversal-${i}`,
      toolName: 'read_file',
      category: 'fs',
      params: { path: `../../../../etc/shadow` },
      timestamp: Date.now(),
    }),
    // 6. Safe FS file read
    (i) => ({
      id: `bench-fs-safe-${i}`,
      toolName: 'read_file',
      category: 'fs',
      params: { path: `src/data/model_${i}.json` },
      timestamp: Date.now(),
    }),
    // 7. Secret token redaction
    (i) => ({
      id: `bench-secret-redact-${i}`,
      toolName: 'api_call',
      category: 'secrets',
      params: { apiKey: 'ghp_' + 'A'.repeat(36), endpoint: '/v1/users' },
      timestamp: Date.now(),
    }),
    // 8. Safe generic tool
    (i) => ({
      id: `bench-calc-${i}`,
      toolName: 'calculate_math',
      category: 'custom',
      params: { expression: `(42 * ${i}) + 100` },
      timestamp: Date.now(),
    }),
  ];

  for (let i = 0; i < count; i++) {
    const generator = templates[i % templates.length];
    payloads.push(generator(i));
  }

  return payloads;
}

/**
 * Calculates percentile from a sorted array of numbers.
 */
function calculatePercentile(sorted: number[], p: number): number {
  if (sorted.length === 0) return 0;
  const index = (p / 100) * (sorted.length - 1);
  const lower = Math.floor(index);
  const upper = Math.ceil(index);
  const weight = index - lower;
  return sorted[lower] * (1 - weight) + sorted[upper] * weight;
}

/**
 * Runs the benchmark harness across synthetic calls and computes detailed latency metrics.
 */
export async function runBenchmarkHarness(options: BenchmarkOptions = {}): Promise<BenchmarkMetrics> {
  const iterations = options.iterations ?? 10000;
  const warmup = options.warmupIterations ?? Math.min(200, Math.floor(iterations * 0.05));
  const engine = options.engine ?? createDefaultCliEngine();

  // 1. Warm-up JIT compiler
  const warmupPayloads = generateSyntheticPayloads(warmup);
  for (const payload of warmupPayloads) {
    await engine.evaluate(payload);
  }

  // 2. Prepare test dataset
  const testPayloads = generateSyntheticPayloads(iterations);
  const latenciesMs: number[] = new Array(iterations);

  let allowCount = 0;
  let blockCount = 0;
  let redactCount = 0;

  const suiteStartHr = process.hrtime.bigint();

  for (let i = 0; i < iterations; i++) {
    const startHr = process.hrtime.bigint();
    const result = await engine.evaluate(testPayloads[i]);
    const endHr = process.hrtime.bigint();

    const elapsedMs = Number(endHr - startHr) / 1_000_000;
    latenciesMs[i] = elapsedMs;

    if (result.verdict === Verdict.BLOCK) blockCount++;
    else if (result.verdict === Verdict.REDACT) redactCount++;
    else allowCount++;
  }

  const suiteEndHr = process.hrtime.bigint();
  const totalDurationMs = Number(suiteEndHr - suiteStartHr) / 1_000_000;

  // 3. Statistical Analysis
  const sorted = [...latenciesMs].sort((a, b) => a - b);
  const sum = sorted.reduce((acc, v) => acc + v, 0);
  const meanLatencyMs = sum / iterations;
  const medianLatencyMs = calculatePercentile(sorted, 50);
  const p95LatencyMs = calculatePercentile(sorted, 95);
  const p99LatencyMs = calculatePercentile(sorted, 99);
  const minLatencyMs = sorted[0];
  const maxLatencyMs = sorted[sorted.length - 1];
  const opsPerSec = totalDurationMs > 0 ? (iterations / (totalDurationMs / 1000)) : 0;

  return {
    totalIterations: iterations,
    totalDurationMs,
    opsPerSec,
    meanLatencyMs,
    medianLatencyMs,
    p95LatencyMs,
    p99LatencyMs,
    minLatencyMs,
    maxLatencyMs,
    allowCount,
    blockCount,
    redactCount,
  };
}

/**
 * Formats benchmark metrics into an ASCII table report.
 */
export function formatBenchmarkReport(metrics: BenchmarkMetrics): string {
  return [
    `========================================================================`,
    `AgentSentinel Benchmark Results (${metrics.totalIterations.toLocaleString()} calls)`,
    `========================================================================`,
    `Total Duration   : ${metrics.totalDurationMs.toFixed(2)} ms`,
    `Throughput       : ${Math.round(metrics.opsPerSec).toLocaleString()} ops/sec`,
    `Mean Latency     : ${metrics.meanLatencyMs.toFixed(4)} ms`,
    `Median (p50)     : ${metrics.medianLatencyMs.toFixed(4)} ms`,
    `95th Percentile  : ${metrics.p95LatencyMs.toFixed(4)} ms`,
    `99th Percentile  : ${metrics.p99LatencyMs.toFixed(4)} ms`,
    `Min / Max Latency: ${metrics.minLatencyMs.toFixed(4)} ms / ${metrics.maxLatencyMs.toFixed(4)} ms`,
    `Allowed / Blocked: ${metrics.allowCount} / ${metrics.blockCount} (${metrics.redactCount} redacted)`,
    `========================================================================`,
  ].join('\n');
}
