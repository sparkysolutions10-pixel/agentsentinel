/**
 * AgentSentinel - Soroban Instance Storage Lifecycle Tracker
 * Tracks contract instance storage expiration ledgers (liveUntilLedger)
 * to warn and intercept interactions with contracts facing imminent archival.
 */
import { SentinelRule } from '../types.js';
export interface StorageLifecycleConfig {
    minLedgersBeforeExpiry?: number;
}
export declare function createInstanceStorageTrackerRule(config?: StorageLifecycleConfig): SentinelRule;
//# sourceMappingURL=instance_storage_tracker.d.ts.map