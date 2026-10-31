/**
 * SlidingWindowLogRateLimiter - Exact timestamp log rate limiter per client key.
 */

export class SlidingWindowLogRateLimiter {
  private logs: Map<string, number[]> = new Map();

  constructor(
    public readonly maxRequests: number,
    public readonly windowMs: number
  ) {
    if (maxRequests <= 0 || windowMs <= 0) {
      throw new Error('maxRequests and windowMs must be positive');
    }
  }

  private prune(key: string, now: number): number[] {
    const cutoff = now - this.windowMs;
    const timestamps = this.logs.get(key) ?? [];
    const valid = timestamps.filter(t => t > cutoff);
    if (valid.length === 0) {
      this.logs.delete(key);
    } else {
      this.logs.set(key, valid);
    }
    return valid;
  }

  public isAllowed(key: string, now: number = Date.now()): boolean {
    const valid = this.prune(key, now);
    if (valid.length < this.maxRequests) {
      valid.push(now);
      this.logs.set(key, valid);
      return true;
    }
    return false;
  }

  public getRemainingRequests(key: string, now: number = Date.now()): number {
    const valid = this.prune(key, now);
    return Math.max(0, this.maxRequests - valid.length);
  }

  public reset(key?: string): void {
    if (key) {
      this.logs.delete(key);
    } else {
      this.logs.clear();
    }
  }
}
