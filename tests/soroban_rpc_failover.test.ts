import { describe, it, expect } from 'vitest';
import { createSorobanRpcFailoverRule } from '../src/web3/soroban_rpc_failover.js';
import { Verdict } from '../src/types.js';

describe('SorobanRpcFailoverRule', () => {
  it('allows requests to healthy, synchronized RPC nodes', () => {
    const rule = createSorobanRpcFailoverRule();
    const violation = rule.evaluate({
      toolName: 'soroban_rpc_call',
      params: { networkLatestLedger: 1000, nodeLatestLedger: 999, rpcLatencyMs: 150 }
    });
    expect(violation).toBeNull();
  });

  it('triggers failover when node ledger lag exceeds tolerance', () => {
    const rule = createSorobanRpcFailoverRule({ maxLedgerLag: 5 });
    const violation = rule.evaluate({
      toolName: 'soroban_rpc_call',
      params: { rpcEndpoint: 'https://primary.node', networkLatestLedger: 1000, nodeLatestLedger: 980 }
    });
    expect(violation).not.toBeNull();
    expect(violation?.verdict).toBe(Verdict.REDACT);
    expect(violation?.redactedParams?.failoverTriggered).toBe(true);
    expect(violation?.detectedPattern).toContain('RPC_LEDGER_LAG');
  });

  it('triggers failover when RPC response latency is too high', () => {
    const rule = createSorobanRpcFailoverRule({ maxLatencyMs: 1000 });
    const violation = rule.evaluate({
      toolName: 'soroban_rpc_call',
      params: { rpcEndpoint: 'https://slow.node', rpcLatencyMs: 3500 }
    });
    expect(violation).not.toBeNull();
    expect(violation?.verdict).toBe(Verdict.REDACT);
    expect(violation?.detectedPattern).toContain('RPC_HIGH_LATENCY');
  });
});
