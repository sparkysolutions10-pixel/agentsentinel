/**
 * AgentSentinel - Qdrant Point Deletion and Batch Clear Blocker Rule.
 * Intercepts batch point deletion and clear operations targeting Qdrant vector databases.
 */
import { SentinelRule } from '../types.js';
export interface QdrantPointDeletionGuardOptions {
    allowFilterDeletion?: boolean;
    maxBatchDeletePoints?: number;
}
export declare function createQdrantPointDeletionGuardRule(options?: QdrantPointDeletionGuardOptions): SentinelRule;
export declare const qdrantPointDeletionGuardRule: SentinelRule;
//# sourceMappingURL=qdrant_deletion_guard.d.ts.map