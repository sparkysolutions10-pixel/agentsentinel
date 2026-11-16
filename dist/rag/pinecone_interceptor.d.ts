/**
 * AgentSentinel - Pinecone Vector Query Interceptor Middleware.
 * Inspects and validates vector query parameters dispatched to Pinecone vector indexes.
 * Blocks NaN/Infinity poisoned embeddings, oversized topK DoS attacks, and invalid vector payloads.
 */
import { SentinelRule } from '../types.js';
export interface PineconeInterceptorOptions {
    maxTopK?: number;
    enforceFiniteNumbers?: boolean;
    blockedTools?: string[];
}
export interface PineconeQueryInspection {
    isPineconeQuery: boolean;
    isValid: boolean;
    violationReason?: string;
    detectedPattern?: string;
}
/**
 * Inspects vector query parameters for adversarial or poisoned payloads.
 */
export declare function inspectPineconeQuery(params: Record<string, any>, options?: PineconeInterceptorOptions): PineconeQueryInspection;
/**
 * Creates SentinelRule to intercept and protect Pinecone vector queries.
 */
export declare function createPineconeQueryInterceptorRule(options?: PineconeInterceptorOptions): SentinelRule;
export declare const pineconeQueryInterceptorRule: SentinelRule;
//# sourceMappingURL=pinecone_interceptor.d.ts.map