/**
 * Maximum File Write Size Ceiling Limiter.
 * Prevents disk exhaustion and buffer stuffing by enforcing a configurable ceiling
 * on individual file write payloads (default: 50MB).
 */
import { SentinelRule } from '../types.js';
export declare const DEFAULT_MAX_WRITE_BYTES: number;
export declare const DEFAULT_WRITE_CONTENT_FIELDS: string[];
/**
 * Calculates byte length across strings, buffers, and Uint8Arrays universally.
 */
export declare function getContentByteLength(content: unknown): number;
export interface WriteSizeLimiterOptions {
    maxSizeBytes?: number;
    contentFields?: string[];
    enforceOnAllTools?: boolean;
}
/**
 * Creates SentinelRule to enforce maximum payload size for file write operations.
 */
export declare function createWriteSizeLimiterRule(options?: WriteSizeLimiterOptions): SentinelRule;
export declare const writeSizeLimiterRule: SentinelRule;
//# sourceMappingURL=write_size_limiter.d.ts.map