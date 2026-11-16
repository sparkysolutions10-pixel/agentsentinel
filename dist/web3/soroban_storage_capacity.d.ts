/**
 * AgentSentinel - Soroban Instance Storage Byte Capacity Ceiling Guard
 * Enforces maximum byte storage capacity (64KB default) per contract instance
 * and single entry size limits to prevent storage bloat and out-of-memory errors.
 */
import { SentinelRule } from '../types.js';
export interface SorobanStorageCapacityConfig {
    maxInstanceBytes?: number;
    maxEntryBytes?: number;
}
export declare function createSorobanStorageCapacityRule(config?: SorobanStorageCapacityConfig): SentinelRule;
//# sourceMappingURL=soroban_storage_capacity.d.ts.map