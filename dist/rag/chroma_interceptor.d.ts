/**
 * AgentSentinel - ChromaDB Local Collection Query Interceptor Rule.
 * Inspects and validates vector query parameters dispatched to ChromaDB collections.
 * Prevents memory exhaustion attacks via oversized n_results and buffer exhaustion via giant strings.
 */
import { SentinelRule } from '../types.js';
export interface ChromaQueryInterceptorOptions {
    maxNResults?: number;
    maxStringLength?: number;
}
export interface ChromaQueryInspection {
    isChromaQuery: boolean;
    isValid: boolean;
    violationReason?: string;
    detectedPattern?: string;
}
/**
 * Inspects ChromaDB query parameters for security violations.
 */
export declare function inspectChromaQuery(params: Record<string, any>, options?: ChromaQueryInterceptorOptions): ChromaQueryInspection;
/**
 * Creates SentinelRule to intercept and protect ChromaDB queries.
 */
export declare function createChromaQueryInterceptorRule(options?: ChromaQueryInterceptorOptions): SentinelRule;
export declare const chromaQueryInterceptorRule: SentinelRule;
//# sourceMappingURL=chroma_interceptor.d.ts.map