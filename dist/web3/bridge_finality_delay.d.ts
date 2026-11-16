/**
 * AgentSentinel - Bridge Finality Delay Monitor
 * Enforces minimum ledger / block confirmation delays between lock and claim
 * to guard against chain reorganization double-spending and unfinalized state execution.
 */
import { SentinelRule } from '../types.js';
export interface BridgeFinalityDelayConfig {
    minConfirmations?: number;
}
export declare function createBridgeFinalityDelayRule(config?: BridgeFinalityDelayConfig): SentinelRule;
//# sourceMappingURL=bridge_finality_delay.d.ts.map