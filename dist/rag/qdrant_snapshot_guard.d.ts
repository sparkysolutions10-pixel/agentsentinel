/**
 * AgentSentinel - Qdrant Collection Snapshot Exfiltration Guard Rule.
 * Intercepts snapshot creation and download requests targeting Qdrant vector collections.
 */
import { SentinelRule } from '../types.js';
export interface QdrantSnapshotGuardOptions {
    allowSnapshots?: boolean;
    action?: 'BLOCK' | 'CONFIRM';
}
export declare function createQdrantSnapshotGuardRule(options?: QdrantSnapshotGuardOptions): SentinelRule;
export declare const qdrantSnapshotGuardRule: SentinelRule;
//# sourceMappingURL=qdrant_snapshot_guard.d.ts.map