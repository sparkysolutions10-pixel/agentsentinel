/**
 * AgentSentinel - ChromaDB Collection Deletion and Reset Blocker.
 * Intercepts destructive actions targeting ChromaDB instances (reset(), delete_collection()).
 */
import { SentinelRule } from '../types.js';
export interface ChromaLifecycleOptions {
    allowReset?: boolean;
    protectedCollections?: string[];
    action?: 'BLOCK' | 'CONFIRM';
}
export declare function createChromaLifecycleProtectorRule(options?: ChromaLifecycleOptions): SentinelRule;
export declare const chromaLifecycleProtectorRule: SentinelRule;
//# sourceMappingURL=chroma_lifecycle.d.ts.map