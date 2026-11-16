/**
 * TokenBucketRateLimiter - Classic token bucket rate limiting algorithm.
 */
export class TokenBucketRateLimiter {
    capacity;
    refillRatePerSecond;
    tokens;
    lastRefillTimestamp;
    constructor(capacity, refillRatePerSecond, initialTokens, now = Date.now()) {
        this.capacity = capacity;
        this.refillRatePerSecond = refillRatePerSecond;
        if (capacity <= 0 || refillRatePerSecond <= 0) {
            throw new Error('Capacity and refill rate must be positive');
        }
        this.tokens = initialTokens !== undefined ? Math.min(capacity, initialTokens) : capacity;
        this.lastRefillTimestamp = now;
    }
    refill(now) {
        const elapsedSeconds = Math.max(0, (now - this.lastRefillTimestamp) / 1000);
        const addedTokens = elapsedSeconds * this.refillRatePerSecond;
        this.tokens = Math.min(this.capacity, this.tokens + addedTokens);
        this.lastRefillTimestamp = now;
    }
    tryConsume(tokens = 1, now = Date.now()) {
        if (tokens <= 0)
            return true;
        this.refill(now);
        if (this.tokens >= tokens) {
            this.tokens -= tokens;
            return true;
        }
        return false;
    }
    getAvailableTokens(now = Date.now()) {
        this.refill(now);
        return this.tokens;
    }
}
//# sourceMappingURL=token_bucket_rate_limiter.js.map