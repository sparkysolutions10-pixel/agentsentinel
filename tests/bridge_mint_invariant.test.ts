import { describe, it, expect } from 'vitest';
import { createBridgeMintInvariantRule } from '../src/web3/bridge_mint_invariant.js';
import { ToolCallContext, Verdict } from '../src/types.js';

describe('BridgeMintInvariantChecker', () => {
  const rule = createBridgeMintInvariantRule({ maxMintRatio: 1.0 });

  it('allows mint request backed 1:1 by locked reserves', () => {
    const context: ToolCallContext = {
      id: 'tx_mint_backed',
      toolName: 'bridge_mint_tokens',
      params: { mintAmount: 10000, lockedReserve: 15000 },
      timestamp: Date.now()
    };

    const violation = rule.evaluate(context);
    expect(violation).toBeNull();
  });

  it('blocks mint request when requested amount exceeds locked reserves', () => {
    const context: ToolCallContext = {
      id: 'tx_mint_unbacked',
      toolName: 'bridge_mint_tokens',
      params: { mintAmount: 50000, lockedReserve: 10000 },
      timestamp: Date.now()
    };

    const violation = rule.evaluate(context);
    expect(violation).not.toBeNull();
    expect(violation?.verdict).toBe(Verdict.BLOCK);
    expect(violation?.severity).toBe('critical');
    expect(violation?.detectedPattern).toContain('RESERVE_INVARIANT_VIOLATION');
  });

  it('blocks mint request when locked reserve is zero or missing', () => {
    const context: ToolCallContext = {
      id: 'tx_mint_zero_reserve',
      toolName: 'bridge_mint_tokens',
      params: { mintAmount: 500, lockedReserve: 0 },
      timestamp: Date.now()
    };

    const violation = rule.evaluate(context);
    expect(violation).not.toBeNull();
    expect(violation?.verdict).toBe(Verdict.BLOCK);
    expect(violation?.detectedPattern).toContain('ZERO_LOCKED_RESERVE');
  });
});
