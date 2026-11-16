/**
 * AgentSentinel - Soroban Temporary vs Persistent Storage Classification Filter
 * Enforces hygiene between Temporary and Persistent storage, preventing ephemeral
 * session facts, nonces, and caches from bloating persistent ledger state.
 */
import { SentinelRule } from '../types.js';
export interface SorobanStorageClassifierConfig {
    disallowTransientInPersistent?: boolean;
}
export declare function createSorobanStorageClassifierRule(config?: SorobanStorageClassifierConfig): SentinelRule;
//# sourceMappingURL=soroban_storage_classifier.d.ts.map