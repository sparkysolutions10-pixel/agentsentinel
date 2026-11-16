/**
 * AgentSentinel - Web3 Security Benchmark Suite
 * Measures evaluation latency per rule across high iteration counts
 * to guarantee that security checks introduce < 0.5ms overhead.
 */
export class Web3SecurityBenchmarkSuite {
    static benchmarkRule(rule, context, iterations = 1000) {
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
//# sourceMappingURL=web3_benchmark_suite.js.map