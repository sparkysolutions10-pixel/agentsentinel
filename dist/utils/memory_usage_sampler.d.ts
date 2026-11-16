/**
 * MemoryUsageSampler - Memory allocation tracking, delta analysis, and threshold enforcement.
 */
export interface MemorySample {
    heapUsed: number;
    heapTotal: number;
    rss: number;
    external: number;
    timestamp: number;
}
export interface MemoryDelta {
    heapUsedDeltaBytes: number;
    rssDeltaBytes: number;
    elapsedMs: number;
}
export declare class MemoryUsageSampler {
    private baseline;
    private lastSample;
    sample(customUsage?: NodeJS.MemoryUsage, timestamp?: number): MemorySample;
    getBaseline(): MemorySample | null;
    getLatest(): MemorySample | null;
    getDeltaFromBaseline(): MemoryDelta | null;
    isWithinLimit(maxRssBytes: number): boolean;
    static formatBytes(bytes: number): string;
    reset(): void;
}
//# sourceMappingURL=memory_usage_sampler.d.ts.map