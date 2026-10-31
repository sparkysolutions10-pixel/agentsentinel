import { describe, it, expect, vi } from 'vitest';
import { StellarMcpSecurityWrapper } from '../src/web3/stellar_mcp_wrapper.js';
import { SentinelEngine } from '../src/index.js';
import { createSorobanTokenTransferCeilingRule } from '../src/web3/soroban_token_ceiling.js';

describe('StellarMcpSecurityWrapper', () => {
  it('executes tool when evaluation passes', async () => {
    const engine = new SentinelEngine();
    engine.registerRule(createSorobanTokenTransferCeilingRule({ maxTransferAmount: 1000 }));
    const wrapper = new StellarMcpSecurityWrapper({ engine });

    const executor = vi.fn().mockResolvedValue({ status: 'success' });
    const { result, evaluation } = await wrapper.wrapToolExecution(
      'stellar_transfer',
      { to: 'GBBD...', amount: 500 },
      executor
    );

    expect(result).toEqual({ status: 'success' });
    expect(evaluation.allowed).toBe(true);
    expect(executor).toHaveBeenCalledTimes(1);
  });

  it('throws and halts execution when tool call violates security rule', async () => {
    const engine = new SentinelEngine();
    engine.registerRule(createSorobanTokenTransferCeilingRule({ maxTransferAmount: 1000 }));
    const wrapper = new StellarMcpSecurityWrapper({ engine });

    const executor = vi.fn().mockResolvedValue({ status: 'should not run' });
    await expect(
      wrapper.wrapToolExecution(
        'stellar_transfer',
        { to: 'GBBD...', amount: 50000 },
        executor
      )
    ).rejects.toThrow('AgentSentinel MCP Guard');

    expect(executor).not.toHaveBeenCalled();
  });
});
