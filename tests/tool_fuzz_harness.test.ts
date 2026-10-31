import { describe, it, expect } from 'vitest';
import { Web3ToolFuzzHarness } from '../src/web3/tool_fuzz_harness.js';
import { createBridgeLockProofRule } from '../src/web3/bridge_lock_proof.js';
import { createBridgeMintInvariantRule } from '../src/web3/bridge_mint_invariant.js';

describe('Web3ToolFuzzHarness', () => {
  it('fuzzes BridgeLockProofRule with zero uncaught crashes', () => {
    const rule = createBridgeLockProofRule();
    const report = Web3ToolFuzzHarness.fuzzRule(rule, 'bridge_mint_tokens');
    expect(report.passed).toBe(true);
    expect(report.crashes).toBe(0);
    expect(report.totalIterations).toBeGreaterThan(10);
  });

  it('fuzzes BridgeMintInvariantRule with zero uncaught crashes', () => {
    const rule = createBridgeMintInvariantRule();
    const report = Web3ToolFuzzHarness.fuzzRule(rule, 'bridge_mint_tokens');
    expect(report.passed).toBe(true);
    expect(report.crashes).toBe(0);
  });
});
