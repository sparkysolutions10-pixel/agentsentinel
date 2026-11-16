/**
 * SlidingWindowLogRateLimiter - Exact timestamp log rate limiter per client key.
 */
export declare class SlidingWindowLogRateLimiter {
    readonly maxRequests: number;
    readonly windowMs: number;
    private logs;
    constructor(maxRequests: number, windowMs: number);
    private prune;
    isAllowed(key: string, now?: number): boolean;
    getRemainingRequests(key: string, now?: number): number;
    reset(key?: string): void;
}
//# sourceMappingURL=sliding_window_log_rate_limiter.d.ts.map