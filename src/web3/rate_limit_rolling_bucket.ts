/**
 * AgentSentinel - Token Bucket Rolling Rate Limiter
 * Provides token bucket rate limiting per agent instance to throttle
 * high-frequency trading bot tool calls and prevent API exhaustion.
 */

export interface TokenBucketOptions {
  capacity: number;       // Max tokens in bucket
  refillRatePerSec: number; // Tokens added per second
}

export class RateLimitRollingBucket {
  private capacity: number;
  private refillRate: number;
  private tokens: number;
  private lastRefill: number;

  constructor(options: TokenBucketOptions) {
    this.capacity = options.capacity;
    this.refillRate = options.refillRatePerSec;
    this.tokens = options.capacity;
    this.lastRefill = Date.now();
  }

  public tryConsume(tokens = 1, now = Date.now()): boolean {
    this.refill(now);

    if (this.tokens >= tokens) {
      this.tokens -= tokens;
      return true;
    }

    return false;
  }

  private refill(now: number): void {
    const elapsedSeconds = (now - this.lastRefill) / 1000;
    if (elapsedSeconds > 0) {
      const addedTokens = elapsedSeconds * this.refillRate;
      this.tokens = Math.min(this.capacity, this.tokens + addedTokens);
      this.lastRefill = now;
    }
  }

  public getAvailableTokens(): number {
    this.refill(Date.now());
    return this.tokens;
  }
}
