/**
 * AgentSentinel - ChromaDB Local Storage Directory Traversal Protector Rule.
 * Ensures ChromaDB persist directory remains strictly confined within the allowed workspace boundary.
 */
import { SentinelRule } from '../types.js';
export interface ChromaStorageGuardOptions {
    allowedWorkspaceRoot?: string;
}
export declare function inspectChromaStoragePath(targetPath: string, allowedWorkspaceRoot?: string): {
    isValid: boolean;
    violationReason?: string;
};
export declare function createChromaStorageDirectoryGuardRule(options?: ChromaStorageGuardOptions): SentinelRule;
export declare const chromaStorageDirectoryGuardRule: SentinelRule;
//# sourceMappingURL=chroma_storage_guard.d.ts.map