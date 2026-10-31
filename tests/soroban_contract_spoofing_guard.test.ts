import { describe, it, expect } from 'vitest';
import { createSorobanContractSpoofingGuardRule } from '../src/web3/soroban_contract_spoofing_guard.js';
import { ToolCallContext, Verdict } from '../src/types.js';

describe('Soroban Contract Spoofing Guard (#913, #914)', () => {
  const verifiedUsdc = 'CCW67TSZV3SSS2HXMBQ5JFGCKJNXKZM7UQUWUZPUTHXSTZLEO7SJMI75';
  const rule = createSorobanContractSpoofingGuardRule({
    verifiedContracts: {
      usdc: verifiedUsdc,
    },
  });

  it('allows invocation of legitimate verified contract address', () => {
    const ctx: ToolCallContext = {
      id: 'spoof-ok-1',
      toolName: 'soroban_invoke',
      params: {
        protocolName: 'usdc',
        contractId: verifiedUsdc,
      },
      timestamp: Date.now(),
    };
    expect(rule.evaluate(ctx)).toBeNull();
  });

  it('blocks fake lookalike contract address masquerading as canonical protocol (#914)', () => {
    const ctx: ToolCallContext = {
      id: 'spoof-fake-1',
      toolName: 'soroban_invoke',
      params: {
        protocolName: 'usdc',
        contractId: 'CFAKE999999999999999999999999999999999999999999999999999',
      },
      timestamp: Date.now(),
    };
    const violation = rule.evaluate(ctx);
    expect(violation).not.toBeNull();
    expect(violation?.verdict).toBe(Verdict.BLOCK);
    expect(violation?.reason).toContain('Contract impersonation spoofing detected');
  });
});
