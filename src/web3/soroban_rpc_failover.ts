/**
 * AgentSentinel - Soroban RPC Node Health Check & Automatic Failover
 * Monitors Soroban RPC latency, desynchronization, and ledger lag;
 * automatically re-routes traffic to healthy secondary nodes when primary lags.
 */

import { SentinelRule, ToolCallContext, RuleViolation, Verdict, ToolCategory } from '../types.js';

export interface SorobanRpcFailoverConfig {
  maxLedgerLag?: number; // max allowed ledger difference behind network tip
  maxLatencyMs?: number; // max allowed response latency in ms
  fallbackEndpoints?: string[];
}

export function createSorobanRpcFailoverRule(config: SorobanRpcFailoverConfig = {}): SentinelRule {
  const maxLag = config.maxLedgerLag ?? 5;
  const maxLatency = config.maxLatencyMs ?? 2000;
  const fallbacks = config.fallbackEndpoints || ['https://soroban-backup.mainnet.stellar.org'];

  return {
    id: 'soroban-rpc-failover',
    name: 'Soroban RPC Health & Failover',
    category: 'custom' as ToolCategory,
    priority: 80,
    enabled: true,

    evaluate(context: ToolCallContext): RuleViolation | null {
      const tool = context.toolName.toLowerCase();
      if (!tool.includes('rpc') && !tool.includes('soroban') && !tool.includes('node')) {
        return null;
      }

      const params = context.params || {};
      const networkTip = Number(params.networkLatestLedger || 0);
      const nodeLedger = Number(params.nodeLatestLedger || 0);
      const latencyMs = Number(params.rpcLatencyMs || 0);

      const isLagging = networkTip > 0 && nodeLedger > 0 && (networkTip - nodeLedger) > maxLag;
      const isSlow = latencyMs > maxLatency;

      if (isLagging || isSlow) {
        const nextEndpoint = fallbacks[0];
        const reason = isLagging
          ? `RPC node is desynced by ${networkTip - nodeLedger} ledgers (tip: ${networkTip}, node: ${nodeLedger}).`
          : `RPC node latency (${latencyMs}ms) exceeded threshold (${maxLatency}ms).`;

        return {
          ruleId: 'soroban-rpc-failover',
          ruleName: 'Soroban RPC Health & Failover',
          severity: 'high',
          verdict: Verdict.REDACT,
          reason: `${reason} Failing over to backup endpoint: ${nextEndpoint}.`,
          detectedPattern: isLagging ? `RPC_LEDGER_LAG:${networkTip - nodeLedger}>${maxLag}` : `RPC_HIGH_LATENCY:${latencyMs}>${maxLatency}`,
          redactedParams: {
            ...params,
            rpcEndpoint: nextEndpoint,
            failoverTriggered: true
          }
        };
      }

      return null;
    }
  };
}
