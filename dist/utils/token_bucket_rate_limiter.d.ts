/**
 * TokenBucketRateLimiter - Classic token bucket rate limiting algorithm.
 */
export declare class TokenBucketRateLimiter {
    readonly capacity: number;
    readonly refillRatePerSecond: number;
    private tokens;
    private lastRefillTimestamp;
    constructor(capacity: number, refillRatePerSecond: number, initialTokens?: number, now?: number);
    private refill;
    tryConsume(tokens?: number, now?: number): boolean;
    getAvailableTokens(now?: number): number;
}
//# sourceMappingURL=token_bucket_rate_limiter.d.ts.map