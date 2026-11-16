/**
 * AgentSentinel High-Performance Latency Benchmark Harness.
 * Measures nanosecond/microsecond execution overhead across 10,000+ synthetic tool calls
 * calculating mean, median, p95, p99 percentiles, and ops/second throughput.
 */
import { SentinelEngine } from '../index.js';
import { ToolCallContext } from '../types.js';
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
export declare function generateSyntheticPayloads(count: number): ToolCallContext[];
/**
 * Runs the benchmark harness across synthetic calls and computes detailed latency metrics.
 */
export declare function runBenchmarkHarness(options?: BenchmarkOptions): Promise<BenchmarkMetrics>;
/**
 * Formats benchmark metrics into an ASCII table report.
 */
export declare function formatBenchmarkReport(metrics: BenchmarkMetrics): string;
//# sourceMappingURL=harness.d.ts.map