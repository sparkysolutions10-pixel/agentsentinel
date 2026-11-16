/**
 * AgentSentinel - Soroban RPC Node Health Check & Automatic Failover
 * Monitors Soroban RPC latency, desynchronization, and ledger lag;
 * automatically re-routes traffic to healthy secondary nodes when primary lags.
 */
import { SentinelRule } from '../types.js';
export interface SorobanRpcFailoverConfig {
    maxLedgerLag?: number;
    maxLatencyMs?: number;
    fallbackEndpoints?: string[];
}
export declare function createSorobanRpcFailoverRule(config?: SorobanRpcFailoverConfig): SentinelRule;
//# sourceMappingURL=soroban_rpc_failover.d.ts.map