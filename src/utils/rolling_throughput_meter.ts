/**
 * RollingThroughputMeter - Sliding window throughput calculator (events/sec).
 */

interface SubBucket {
  timestamp: number;
  count: number;
}

export class RollingThroughputMeter {
  private buckets: SubBucket[] = [];
  private totalLifetimeCount: number = 0;

  constructor(
    public readonly windowMs: number = 60000,
    public readonly bucketResolutionMs: number = 1000
  ) {
    if (windowMs <= 0 || bucketResolutionMs <= 0) {
      throw new Error('Window and bucket resolution must be positive numbers');
    }
  }

  private prune(now: number): void {
    const cutoff = now - this.windowMs;
    this.buckets = this.buckets.filter(b => b.timestamp > cutoff);
  }

  public mark(count: number = 1, now: number = Date.now()): void {
    if (count <= 0) return;
    this.prune(now);
    this.totalLifetimeCount += count;

    const currentBucketTimestamp = Math.floor(now / this.bucketResolutionMs) * this.bucketResolutionMs;
    const existing = this.buckets.find(b => b.timestamp === currentBucketTimestamp);

    if (existing) {
      existing.count += count;
    } else {
      this.buckets.push({ timestamp: currentBucketTimestamp, count });
    }
  }

  public getRatePerSecond(now: number = Date.now()): number {
    this.prune(now);
    const windowEvents = this.buckets.reduce((acc, b) => acc + b.count, 0);
    const windowSeconds = this.windowMs / 1000;
    return windowEvents / windowSeconds;
  }

  public getWindowCount(now: number = Date.now()): number {
    this.prune(now);
    return this.buckets.reduce((acc, b) => acc + b.count, 0);
  }

  public getTotalCount(): number {
    return this.totalLifetimeCount;
  }

  public reset(): void {
    this.buckets = [];
    this.totalLifetimeCount = 0;
  }
}
