/**
 * RollingThroughputMeter - Sliding window throughput calculator (events/sec).
 */
export class RollingThroughputMeter {
    windowMs;
    bucketResolutionMs;
    buckets = [];
    totalLifetimeCount = 0;
    constructor(windowMs = 60000, bucketResolutionMs = 1000) {
        this.windowMs = windowMs;
        this.bucketResolutionMs = bucketResolutionMs;
        if (windowMs <= 0 || bucketResolutionMs <= 0) {
            throw new Error('Window and bucket resolution must be positive numbers');
        }
    }
    prune(now) {
        const cutoff = now - this.windowMs;
        this.buckets = this.buckets.filter(b => b.timestamp > cutoff);
    }
    mark(count = 1, now = Date.now()) {
        if (count <= 0)
            return;
        this.prune(now);
        this.totalLifetimeCount += count;
        const currentBucketTimestamp = Math.floor(now / this.bucketResolutionMs) * this.bucketResolutionMs;
        const existing = this.buckets.find(b => b.timestamp === currentBucketTimestamp);
        if (existing) {
            existing.count += count;
        }
        else {
            this.buckets.push({ timestamp: currentBucketTimestamp, count });
        }
    }
    getRatePerSecond(now = Date.now()) {
        this.prune(now);
        const windowEvents = this.buckets.reduce((acc, b) => acc + b.count, 0);
        const windowSeconds = this.windowMs / 1000;
        return windowEvents / windowSeconds;
    }
    getWindowCount(now = Date.now()) {
        this.prune(now);
        return this.buckets.reduce((acc, b) => acc + b.count, 0);
    }
    getTotalCount() {
        return this.totalLifetimeCount;
    }
    reset() {
        this.buckets = [];
        this.totalLifetimeCount = 0;
    }
}
//# sourceMappingURL=rolling_throughput_meter.js.map