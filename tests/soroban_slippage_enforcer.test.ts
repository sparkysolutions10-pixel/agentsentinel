import { describe, it, expect } from 'vitest';
import { createSorobanSlippageEnforcerRule } from '../src/web3/soroban_slippage_enforcer.js';
import { ToolCallContext, Verdict } from '../src/types.js';

describe('Soroban DEX Slippage Enforcer (#917, #918)', () => {
  const rule = createSorobanSlippageEnforcerRule({ maxSlippagePercent: 0.5 });

  it('allows swap with low slippage within safety tolerance', () => {
    const ctx: ToolCallContext = {
      id: 'swap-safe-1',
      toolName: 'soroban_swap',
      params: {
        expectedAmountOut: 1000,
        minAmountOut: 998, // 0.2% slippage <= 0.5%
      },
      timestamp: Date.now(),
    };
    expect(rule.evaluate(ctx)).toBeNull();
  });

  it('blocks swap with high slippage exceeding 0.5% ceiling (#918)', () => {
    const ctx: ToolCallContext = {
      id: 'swap-bad-slippage-1',
      toolName: 'soroban_swap',
      params: {
        expectedAmountOut: 1000,
        minAmountOut: 975, // 2.5% slippage > 0.5%
      },
      timestamp: Date.now(),
    };
    const violation = rule.evaluate(ctx);
    expect(violation).not.toBeNull();
    expect(violation?.verdict).toBe(Verdict.BLOCK);
    expect(violation?.reason).toContain('Swap slippage tolerance');
  });
});
