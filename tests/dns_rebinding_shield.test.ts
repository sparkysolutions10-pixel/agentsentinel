import { describe, it, expect } from 'vitest';
import { createDnsRebindingShieldRule } from '../src/web3/dns_rebinding_shield.js';
import { ToolCallContext, Verdict } from '../src/types.js';

describe('DnsRebindingShield', () => {
  const rule = createDnsRebindingShieldRule();

  it('allows public HTTPS RPC endpoints', () => {
    const context: ToolCallContext = {
      id: 'tx_rpc_public',
      toolName: 'soroban_rpc_call',
      params: { rpcUrl: 'https://mainnet.stellar.org/rpc' },
      timestamp: Date.now()
    };

    const violation = rule.evaluate(context);
    expect(violation).toBeNull();
  });

  it('blocks localhost and 127.0.0.1 RPC requests', () => {
    const context: ToolCallContext = {
      id: 'tx_rpc_localhost',
      toolName: 'soroban_rpc_call',
      params: { rpcUrl: 'http://127.0.0.1:8545' },
      timestamp: Date.now()
    };

    const violation = rule.evaluate(context);
    expect(violation).not.toBeNull();
    expect(violation?.verdict).toBe(Verdict.BLOCK);
    expect(violation?.detectedPattern).toContain('FORBIDDEN_INTERNAL_HOST:127.0.0.1');
  });

  it('blocks cloud metadata endpoint 169.254.169.254', () => {
    const context: ToolCallContext = {
      id: 'tx_rpc_metadata',
      toolName: 'soroban_rpc_call',
      params: { rpcUrl: 'http://169.254.169.254/latest/meta-data/' },
      timestamp: Date.now()
    };

    const violation = rule.evaluate(context);
    expect(violation).not.toBeNull();
    expect(violation?.verdict).toBe(Verdict.BLOCK);
    expect(violation?.detectedPattern).toContain('FORBIDDEN_INTERNAL_HOST:169.254.169.254');
  });
});
