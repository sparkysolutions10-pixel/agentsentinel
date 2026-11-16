export class LeakyBucketRateLimiter {
    capacity;
    leakRatePerMs;
    water = 0;
    lastLeakTime = null;
    constructor(capacity, leakRatePerSecond) {
        this.capacity = capacity;
        this.leakRatePerMs = leakRatePerSecond / 1000;
    }
    allowRequest(cost = 1, now = Date.now()) {
        this.leak(now);
        if (this.water + cost <= this.capacity) {
            this.water += cost;
            return true;
        }
        return false;
    }
    leak(now) {
        if (this.lastLeakTime === null) {
            this.lastLeakTime = now;
            return;
        }
        const elapsed = now - this.lastLeakTime;
        if (elapsed > 0) {
            const leaked = elapsed * this.leakRatePerMs;
            this.water = Math.max(0, this.water - leaked);
            this.lastLeakTime = now;
        }
    }
    getWaterLevel() {
        return this.water;
    }
}
//# sourceMappingURL=leaky_bucket_rate_limiter.js.map