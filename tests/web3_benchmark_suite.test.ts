import { describe, it, expect } from 'vitest';
import { Web3SecurityBenchmarkSuite } from '../src/web3/web3_benchmark_suite.js';
import { createBridgeLockProofRule } from '../src/web3/bridge_lock_proof.js';

describe('Web3SecurityBenchmarkSuite', () => {
  it('benchmarks rule execution with sub-millisecond latency', () => {
    const rule = createBridgeLockProofRule();
    const context = {
      id: 'tx_bench',
      toolName: 'bridge_mint',
      params: { sourceChain: 'ethereum', proof: ['0x' + '11'.repeat(32)] },
      timestamp: Date.now()
    };

    const result = Web3SecurityBenchmarkSuite.benchmarkRule(rule, context, 500);
    expect(result.iterations).toBe(500);
    expect(result.averageTimeMs).toBeLessThan(1.0);
    expect(result.passedSubMillisecond).toBe(true);
  });
});
