export declare class LeakyBucketRateLimiter {
    private capacity;
    private leakRatePerMs;
    private water;
    private lastLeakTime;
    constructor(capacity: number, leakRatePerSecond: number);
    allowRequest(cost?: number, now?: number): boolean;
    private leak;
    getWaterLevel(): number;
}
//# sourceMappingURL=leaky_bucket_rate_limiter.d.ts.map