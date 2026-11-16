/**
 * AgentSentinel - Vector Payload Metadata Key-Value Sanitizer.
 * Scans, detects, and neutralizes XSS payloads (<script>, iframe), prompt injection
 * triggers, and oversized metadata payloads attached to vector embeddings across RAG vector stores.
 */
import { SentinelRule } from '../types.js';
export interface VectorMetadataSanitizerOptions {
    mode?: 'block' | 'redact';
    maxMetadataBytes?: number;
    blockPromptInjection?: boolean;
    stripHtmlTags?: boolean;
}
export interface MetadataScanResult {
    hasViolation: boolean;
    reason?: string;
    detectedPattern?: string;
    sanitizedMetadata?: Record<string, any>;
}
/**
 * Scans and sanitizes metadata key-value dictionary.
 */
export declare function scanAndSanitizeMetadata(rawMetadata: unknown, options?: VectorMetadataSanitizerOptions): MetadataScanResult;
/**
 * Creates SentinelRule to inspect and sanitize vector metadata payloads.
 */
export declare function createVectorMetadataSanitizerRule(options?: VectorMetadataSanitizerOptions): SentinelRule;
export declare const defaultVectorMetadataSanitizerRule: SentinelRule;
//# sourceMappingURL=metadata_sanitizer.d.ts.map