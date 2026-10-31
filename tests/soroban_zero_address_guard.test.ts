import { describe, it, expect } from 'vitest';
import { createSorobanZeroAddressBurnInterceptorRule } from '../src/web3/soroban_zero_address_guard.js';
import { Verdict } from '../src/types.js';

describe('SorobanZeroAddressBurnInterceptorRule', () => {
  it('allows transfers to valid, non-zero Stellar recipient addresses', () => {
    const rule = createSorobanZeroAddressBurnInterceptorRule();
    const violation = rule.evaluate({
      toolName: 'soroban_transfer',
      params: { to: 'GBBD67IFDDNVVUWW7AUXCXP22OHGDBC3TVN', amount: 100 }
    });
    expect(violation).toBeNull();
  });

  it('blocks transfer directed to Stellar 32-zero public key', () => {
    const rule = createSorobanZeroAddressBurnInterceptorRule();
    const violation = rule.evaluate({
      toolName: 'soroban_transfer',
      params: { to: 'GAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAWHF', amount: 100 }
    });
    expect(violation).not.toBeNull();
    expect(violation?.verdict).toBe(Verdict.BLOCK);
    expect(violation?.severity).toBe('critical');
    expect(violation?.detectedPattern).toContain('BURN_DESTINATION_INTERCEPTED');
  });

  it('blocks transfer directed to EVM dead address', () => {
    const rule = createSorobanZeroAddressBurnInterceptorRule();
    const violation = rule.evaluate({
      toolName: 'soroban_token_send',
      params: { recipient: '0x000000000000000000000000000000000000dead', amount: 50 }
    });
    expect(violation).not.toBeNull();
    expect(violation?.verdict).toBe(Verdict.BLOCK);
  });

  it('allows intentional burn invocations', () => {
    const rule = createSorobanZeroAddressBurnInterceptorRule();
    const violation = rule.evaluate({
      toolName: 'token_burn',
      params: { target: '0x0000000000000000000000000000000000000000', amount: 50 }
    });
    expect(violation).toBeNull();
  });
});
