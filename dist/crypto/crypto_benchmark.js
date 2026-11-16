import crypto from 'crypto';
export function runCryptoPerformanceBenchmark(iterations = 20000) {
    const secretKey = Buffer.from('benchmark-secret-key-32-bytes!!');
    const salt = Buffer.from('benchmark-salt-16');
    const info = 'agent-benchmark-info';
    const start = performance.now();
    for (let i = 0; i < iterations; i++) {
        crypto.hkdfSync('sha256', secretKey, salt, Buffer.from(info), 32);
    }
    const totalDurationMs = performance.now() - start;
    const averageLatencyMs = totalDurationMs / iterations;
    const operationsPerSecond = (iterations / totalDurationMs) * 1000;
    return {
        operationsPerSecond,
        totalOperations: iterations,
        totalDurationMs,
        averageLatencyMs
    };
}
//# sourceMappingURL=crypto_benchmark.js.map