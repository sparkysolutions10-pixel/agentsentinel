/**
 * AgentSentinel - Soroban Temporary Storage Pruner Simulator
 * Prevents developers and autonomous agents from storing persistent state (balances, allowances)
 * in Soroban Temporary storage entries that will be automatically destroyed upon TTL expiration.
 */
import { SentinelRule } from '../types.js';
export declare function createTemporaryStoragePrunerRule(): SentinelRule;
//# sourceMappingURL=temporary_storage_pruner.d.ts.map