/**
 * AgentSentinel - Token Bucket Rolling Rate Limiter
 * Provides token bucket rate limiting per agent instance to throttle
 * high-frequency trading bot tool calls and prevent API exhaustion.
 */
export interface TokenBucketOptions {
    capacity: number;
    refillRatePerSec: number;
}
export declare class RateLimitRollingBucket {
    private capacity;
    private refillRate;
    private tokens;
    private lastRefill;
    constructor(options: TokenBucketOptions);
    tryConsume(tokens?: number, now?: number): boolean;
    private refill;
    getAvailableTokens(): number;
}
//# sourceMappingURL=rate_limit_rolling_bucket.d.ts.map