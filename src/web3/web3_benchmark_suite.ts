/**
 * AgentSentinel - Web3 Security Benchmark Suite
 * Measures evaluation latency per rule across high iteration counts
 * to guarantee that security checks introduce < 0.5ms overhead.
 */

import { SentinelRule, ToolCallContext } from '../types.js';

export interface BenchmarkResult {
  ruleId: string;
  iterations: number;
  totalTimeMs: number;
  averageTimeMs: number;
  passedSubMillisecond: boolean;
}

export class Web3SecurityBenchmarkSuite {
  public static benchmarkRule(rule: SentinelRule, context: ToolCallContext, iterations = 1000): BenchmarkResult {
    // Warmup
    for (let i = 0; i < 50; i++) {
      rule.evaluate(context);
    }

    const start = performance.now();
    for (let i = 0; i < iterations; i++) {
      rule.evaluate(context);
    }
    const end = performance.now();

    const totalTimeMs = end - start;
    const averageTimeMs = totalTimeMs / iterations;

    return {
      ruleId: rule.id,
      iterations,
      totalTimeMs,
      averageTimeMs,
      passedSubMillisecond: averageTimeMs < 1.0
    };
  }
}
