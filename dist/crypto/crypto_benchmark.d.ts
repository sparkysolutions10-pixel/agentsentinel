export interface CryptoBenchmarkResult {
    operationsPerSecond: number;
    totalOperations: number;
    totalDurationMs: number;
    averageLatencyMs: number;
}
export declare function runCryptoPerformanceBenchmark(iterations?: number): CryptoBenchmarkResult;
//# sourceMappingURL=crypto_benchmark.d.ts.map