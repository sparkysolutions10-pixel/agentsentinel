import { describe, it, expect } from 'vitest';
import { runCryptoPerformanceBenchmark } from '../src/crypto/crypto_benchmark.js';

describe('Cryptographic Performance Benchmark (#877 & #878)', () => {
  it('verifies > 10,000 operations per second throughput', () => {
    const result = runCryptoPerformanceBenchmark(5000);
    expect(result.totalOperations).toBe(5000);
    expect(result.operationsPerSecond).toBeGreaterThan(10000);
    expect(result.averageLatencyMs).toBeLessThan(0.1);
  });
});
