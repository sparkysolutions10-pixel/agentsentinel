/**
 * AgentSentinel - Soroban State Archival TTL Expiration & Extension Monitor
 * Tracks live ledger entry TTL and prevents contract execution failures
 * caused by expired or impending state archival in Soroban persistent storage.
 */
import { SentinelRule } from '../types.js';
export interface SorobanTtlMonitorConfig {
    minTtlLedgers?: number;
    warningTtlLedgers?: number;
}
export declare function createSorobanTtlMonitorRule(config?: SorobanTtlMonitorConfig): SentinelRule;
//# sourceMappingURL=soroban_ttl_monitor.d.ts.map