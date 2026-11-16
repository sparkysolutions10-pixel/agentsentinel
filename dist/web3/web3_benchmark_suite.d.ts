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
export declare class Web3SecurityBenchmarkSuite {
    static benchmarkRule(rule: SentinelRule, context: ToolCallContext, iterations?: number): BenchmarkResult;
}
//# sourceMappingURL=web3_benchmark_suite.d.ts.map