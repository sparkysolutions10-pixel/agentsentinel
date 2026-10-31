import { describe, it, expect } from 'vitest';
import { createSorobanReentrancyGuardRule } from '../src/web3/soroban_reentrancy_guard.js';
import { ToolCallContext, Verdict } from '../src/types.js';

describe('Soroban Read-Only Reentrancy Guard (#909, #910)', () => {
  const mutatingContract = 'CDLZFC3SYJYDZT7K67VZ75HPJVIEUVNIXF47ZG2FB2RMQQVU2HHGCYSC';
  const rule = createSorobanReentrancyGuardRule({
    pendingMutations: [mutatingContract],
  });

  it('allows view calls on idle, non-mutating contracts', () => {
    const ctx: ToolCallContext = {
      id: 'reentrancy-ok-1',
      toolName: 'soroban_invoke',
      params: {
        contractId: 'CBBBAAA9999999999999999999999999999999999999999999999999',
        function: 'get_balance',
      },
      timestamp: Date.now(),
    };
    expect(rule.evaluate(ctx)).toBeNull();
  });

  it('blocks read-only view function calls during pending contract state mutation (#910)', () => {
    const ctx: ToolCallContext = {
      id: 'reentrancy-blocked-1',
      toolName: 'soroban_invoke',
      params: {
        contractId: mutatingContract,
        function: 'get_pool_reserve_ratio',
      },
      timestamp: Date.now(),
    };
    const violation = rule.evaluate(ctx);
    expect(violation).not.toBeNull();
    expect(violation?.verdict).toBe(Verdict.BLOCK);
    expect(violation?.reason).toContain('Read-only reentrancy vulnerability detected');
  });
});
