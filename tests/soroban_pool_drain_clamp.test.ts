import { describe, it, expect } from 'vitest';
import { createSorobanPoolDrainClampRule } from '../src/web3/soroban_pool_drain_clamp.js';
import { ToolCallContext, Verdict } from '../src/types.js';

describe('Soroban Pool Drain Clamp (#925, #926)', () => {
  const rule = createSorobanPoolDrainClampRule({ maxDrainPercent: 10.0 });

  it('allows withdrawal within safe pool reserve limit', () => {
    const ctx: ToolCallContext = {
      id: 'drain-ok-1',
      toolName: 'soroban_pool_withdraw',
      params: {
        withdrawAmount: 5000,
        poolReserves: 100000, // 5% <= 10%
      },
      timestamp: Date.now(),
    };
    expect(rule.evaluate(ctx)).toBeNull();
  });

  it('blocks withdrawal exceeding 10% pool reserves (#926)', () => {
    const ctx: ToolCallContext = {
      id: 'drain-bad-1',
      toolName: 'soroban_pool_withdraw',
      params: {
        withdrawAmount: 25000,
        poolReserves: 100000, // 25% > 10%
      },
      timestamp: Date.now(),
    };
    const violation = rule.evaluate(ctx);
    expect(violation).not.toBeNull();
    expect(violation?.verdict).toBe(Verdict.BLOCK);
    expect(violation?.reason).toContain('Excessive liquidity extraction');
  });
});
