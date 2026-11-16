/**
 * AgentSentinel - ChromaDB Batch Document Upsert Size Limiter Rule.
 * Restricts document count and payload byte boundaries on collection add/upsert calls.
 */
import { SentinelRule } from '../types.js';
export interface ChromaBatchLimiterOptions {
    maxDocuments?: number;
    maxPayloadBytes?: number;
}
export declare function inspectChromaBatch(params: Record<string, any>, options?: ChromaBatchLimiterOptions): {
    isValid: boolean;
    violationReason?: string;
    detectedPattern?: string;
};
export declare function createChromaBatchSizeLimiterRule(options?: ChromaBatchLimiterOptions): SentinelRule;
export declare const chromaBatchSizeLimiterRule: SentinelRule;
//# sourceMappingURL=chroma_batch_limiter.d.ts.map