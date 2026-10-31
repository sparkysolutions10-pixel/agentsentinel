import { describe, it, expect } from 'vitest';
import { createSorobanCallbackDetectorRule } from '../src/web3/soroban_callback_detector.js';
import { ToolCallContext, Verdict } from '../src/types.js';

describe('Soroban Callback Honeypot Detector (#911, #912)', () => {
  const agentWallet = 'GBBD47IF6LWK7P7MDEVSCWR7DPUWV3NY3DTQEVFL4NAT4AQH3ZLLFLA5';
  const rule = createSorobanCallbackDetectorRule({
    agentAddress: agentWallet,
    disallowSelfCallbacks: true,
  });

  it('allows safe regular function invocations', () => {
    const ctx: ToolCallContext = {
      id: 'cb-safe-1',
      toolName: 'soroban_invoke',
      params: {
        contractId: 'CDLZFC3SYJYDZT7K67VZ75HPJVIEUVNIXF47ZG2FB2RMQQVU2HHGCYSC',
        function: 'transfer',
      },
      timestamp: Date.now(),
    };
    expect(rule.evaluate(ctx)).toBeNull();
  });

  it('blocks recursive boomerang callback targeting caller wallet (#912)', () => {
    const ctx: ToolCallContext = {
      id: 'cb-boomerang-1',
      toolName: 'soroban_invoke',
      params: {
        contractId: 'CDLZFC3SYJYDZT7K67VZ75HPJVIEUVNIXF47ZG2FB2RMQQVU2HHGCYSC',
        function: 'execute_trade_callback',
        callbackAddress: agentWallet,
      },
      timestamp: Date.now(),
    };
    const violation = rule.evaluate(ctx);
    expect(violation).not.toBeNull();
    expect(violation?.verdict).toBe(Verdict.BLOCK);
    expect(violation?.reason).toContain('Recursive boomerang callback detected');
  });
});
