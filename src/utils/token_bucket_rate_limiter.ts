/**
 * TokenBucketRateLimiter - Classic token bucket rate limiting algorithm.
 */

export class TokenBucketRateLimiter {
  private tokens: number;
  private lastRefillTimestamp: number;

  constructor(
    public readonly capacity: number,
    public readonly refillRatePerSecond: number,
    initialTokens?: number,
    now: number = Date.now()
  ) {
    if (capacity <= 0 || refillRatePerSecond <= 0) {
      throw new Error('Capacity and refill rate must be positive');
    }
    this.tokens = initialTokens !== undefined ? Math.min(capacity, initialTokens) : capacity;
    this.lastRefillTimestamp = now;
  }

  private refill(now: number): void {
    const elapsedSeconds = Math.max(0, (now - this.lastRefillTimestamp) / 1000);
    const addedTokens = elapsedSeconds * this.refillRatePerSecond;
    this.tokens = Math.min(this.capacity, this.tokens + addedTokens);
    this.lastRefillTimestamp = now;
  }

  public tryConsume(tokens: number = 1, now: number = Date.now()): boolean {
    if (tokens <= 0) return true;
    this.refill(now);

    if (this.tokens >= tokens) {
      this.tokens -= tokens;
      return true;
    }
    return false;
  }

  public getAvailableTokens(now: number = Date.now()): number {
    this.refill(now);
    return this.tokens;
  }
}
