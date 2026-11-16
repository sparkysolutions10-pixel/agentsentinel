/**
 * AgentSentinel - Soroban Read-Write Footprint Memory Conflict Guard
 * Inspects Soroban ledger footprints to prevent concurrent write-write
 * collisions, invalid self-collisions, and ledger footprint capacity exhaustion.
 */
import { SentinelRule } from '../types.js';
export interface SorobanFootprintGuardConfig {
    maxFootprintKeys?: number;
    allowReadConcurrency?: boolean;
    activeLocks?: Set<string> | string[];
}
export declare function createSorobanFootprintGuardRule(config?: SorobanFootprintGuardConfig): SentinelRule;
//# sourceMappingURL=soroban_footprint_guard.d.ts.map