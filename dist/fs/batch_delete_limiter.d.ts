/**
 * Batch File Delete Threshold and Rate Limiter.
 * Intercepts bulk or runaway file deletion operations exceeding a configurable
 * threshold (default: 20 files per minute) or mass multi-file delete arrays.
 */
import { SentinelRule } from '../types.js';
export declare const DEFAULT_MAX_DELETES_PER_MINUTE = 20;
export declare const DEFAULT_DELETE_WINDOW_MS: number;
export interface BatchDeleteLimiterOptions {
    maxDeletesPerMinute?: number;
    windowMs?: number;
    deleteToolPattern?: RegExp;
}
export declare class BatchDeleteTracker {
    private deletionTimestamps;
    readonly maxDeletes: number;
    readonly windowMs: number;
    constructor(maxDeletes?: number, windowMs?: number);
    /**
     * Cleans timestamps outside the sliding window.
     */
    private prune;
    /**
     * Records deletion count and checks if limit is exceeded.
     */
    record(count?: number, now?: number): {
        currentCount: number;
        isExceeded: boolean;
    };
    /**
     * Checks current count without modifying history.
     */
    check(additionalCount?: number, now?: number): {
        currentCount: number;
        wouldExceed: boolean;
    };
    /**
     * Resets the tracker history.
     */
    reset(): void;
}
/**
 * Creates SentinelRule to rate-limit bulk file deletions.
 */
export declare function createBatchDeleteLimiterRule(options?: BatchDeleteLimiterOptions): SentinelRule & {
    tracker: BatchDeleteTracker;
};
export declare const batchDeleteLimiterRule: SentinelRule & {
    tracker: BatchDeleteTracker;
};
//# sourceMappingURL=batch_delete_limiter.d.ts.map