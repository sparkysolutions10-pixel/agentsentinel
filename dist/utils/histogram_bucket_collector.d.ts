/**
 * HistogramBucketCollector - Cumulative bucket histogram for latency and distribution tracking.
 */
export interface BucketCount {
    le: number | '+Inf';
    count: number;
}
export declare class HistogramBucketCollector {
    readonly name: string;
    readonly help: string;
    readonly sortedBuckets: number[];
    private bucketCounts;
    private infCount;
    private totalCount;
    private totalSum;
    constructor(name: string, help: string, buckets?: number[]);
    observe(value: number): void;
    getCount(): number;
    getSum(): number;
    getBucketCounts(): BucketCount[];
    reset(): void;
    toPrometheus(): string;
}
//# sourceMappingURL=histogram_bucket_collector.d.ts.map