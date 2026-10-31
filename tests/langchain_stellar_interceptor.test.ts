import { describe, it, expect } from 'vitest';
import { LangChainStellarSecurityInterceptor } from '../src/web3/langchain_stellar_interceptor.js';
import { SentinelEngine } from '../src/index.js';
import { createSorobanZeroAddressBurnInterceptorRule } from '../src/web3/soroban_zero_address_guard.js';

describe('LangChainStellarSecurityInterceptor', () => {
  it('allows safe LangChain agent tool invocations', async () => {
    const engine = new SentinelEngine();
    engine.registerRule(createSorobanZeroAddressBurnInterceptorRule());
    const interceptor = new LangChainStellarSecurityInterceptor({ engine });

    const input = { to: 'GBBD67IFDDNVVUWW7AUXCXP22OHGDBC3TVN', amount: 10 };
    const result = await interceptor.intercept('stellar_payment_tool', input);
    expect(result).toEqual(input);
  });

  it('intercepts and returns safety block message for malicious parameters', async () => {
    const engine = new SentinelEngine();
    engine.registerRule(createSorobanZeroAddressBurnInterceptorRule());
    const interceptor = new LangChainStellarSecurityInterceptor({ engine });

    const input = { to: 'GAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAWHF', amount: 10 };
    const result = await interceptor.intercept('stellar_payment_tool', input);
    expect(typeof result).toBe('string');
    expect(result).toContain('AgentSentinel Security Intercepted');
  });
});
