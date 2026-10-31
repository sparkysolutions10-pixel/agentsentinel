import { describe, it, expect } from 'vitest';
import { SorobanSentinelCoordinator } from '../src/web3/soroban_sentinel_coordinator.js';
import { Verdict } from '../src/types.js';

describe('SorobanSentinelCoordinator', () => {
  it('instantiates coordinator and allows safe tool calls across layers', async () => {
    const coordinator = new SorobanSentinelCoordinator();
    const result = await coordinator.evaluateToolCall({
      toolName: 'soroban_read_state',
      params: { contractId: 'C123', keys: ['balance'] }
    });
    expect(result.allowed).toBe(true);
    expect(result.verdict).toBe(Verdict.ALLOW);
  });

  it('coordinates interception of unsafe multi-layer tool calls', async () => {
    const coordinator = new SorobanSentinelCoordinator();
    const result = await coordinator.evaluateToolCall({
      toolName: 'soroban_token_transfer',
      params: { to: 'GAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAWHF', amount: 500 }
    });
    expect(result.allowed).toBe(false);
    expect(result.verdict).toBe(Verdict.BLOCK);
    expect(result.violations.length).toBeGreaterThan(0);
  });
});
