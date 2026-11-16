/**
 * AgentSentinel - Pinecone Index Deletion and Vector Wipe Protector.
 * Intercepts and strictly prevents catastrophic deletion of entire vector indexes
 * (e.g. `deleteIndex`, `delete_index`, `deleteAll: true`, `dropCollection`)
 * by autonomous AI agents.
 */
import { SentinelRule } from '../types.js';
export interface PineconeIndexProtectorOptions {
    /**
     * Whether to downgrade BLOCK to interactive CONFIRM (e.g. in dev sandboxes).
     * Default: false (Strict BLOCK).
     */
    requireConfirmation?: boolean;
    /**
     * Explicit list of protected index names. If omitted, all index deletions are guarded.
     */
    protectedIndices?: string[];
}
export interface IndexDeletionInspection {
    isDestructiveDeletion: boolean;
    targetIndex?: string;
    operation?: string;
    reason?: string;
}
/**
 * Inspects a tool call to detect index drops or vector wipe operations.
 */
export declare function inspectIndexDeletion(toolName: string, params?: Record<string, any>, options?: PineconeIndexProtectorOptions): IndexDeletionInspection;
/**
 * Creates SentinelRule to guard Pinecone index lifecycles.
 */
export declare function createPineconeIndexProtectorRule(options?: PineconeIndexProtectorOptions): SentinelRule;
export declare const pineconeIndexProtectorRule: SentinelRule;
//# sourceMappingURL=pinecone_index_protector.d.ts.map