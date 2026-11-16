/**
 * AgentSentinel - Token Bucket Rolling Rate Limiter
 * Provides token bucket rate limiting per agent instance to throttle
 * high-frequency trading bot tool calls and prevent API exhaustion.
 */
export class RateLimitRollingBucket {
    capacity;
    refillRate;
    tokens;
    lastRefill;
    constructor(options) {
        this.capacity = options.capacity;
        this.refillRate = options.refillRatePerSec;
        this.tokens = options.capacity;
        this.lastRefill = Date.now();
    }
    tryConsume(tokens = 1, now = Date.now()) {
        this.refill(now);
        if (this.tokens >= tokens) {
            this.tokens -= tokens;
            return true;
        }
        return false;
    }
    refill(now) {
        const elapsedSeconds = (now - this.lastRefill) / 1000;
        if (elapsedSeconds > 0) {
            const addedTokens = elapsedSeconds * this.refillRate;
            this.tokens = Math.min(this.capacity, this.tokens + addedTokens);
            this.lastRefill = now;
        }
    }
    getAvailableTokens() {
        this.refill(Date.now());
        return this.tokens;
    }
}
//# sourceMappingURL=rate_limit_rolling_bucket.js.map