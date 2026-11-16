/**
 * RollingThroughputMeter - Sliding window throughput calculator (events/sec).
 */
export declare class RollingThroughputMeter {
    readonly windowMs: number;
    readonly bucketResolutionMs: number;
    private buckets;
    private totalLifetimeCount;
    constructor(windowMs?: number, bucketResolutionMs?: number);
    private prune;
    mark(count?: number, now?: number): void;
    getRatePerSecond(now?: number): number;
    getWindowCount(now?: number): number;
    getTotalCount(): number;
    reset(): void;
}
//# sourceMappingURL=rolling_throughput_meter.d.ts.map