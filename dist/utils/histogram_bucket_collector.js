/**
 * HistogramBucketCollector - Cumulative bucket histogram for latency and distribution tracking.
 */
export class HistogramBucketCollector {
    name;
    help;
    sortedBuckets;
    bucketCounts;
    infCount = 0;
    totalCount = 0;
    totalSum = 0;
    constructor(name, help, buckets = [5, 10, 25, 50, 100, 250, 500, 1000]) {
        this.name = name;
        this.help = help;
        if (!name || !/^[a-zA-Z_:][a-zA-Z0-9_:]*$/.test(name)) {
            throw new Error(`Invalid metric name: ${name}`);
        }
        this.sortedBuckets = [...new Set(buckets)].sort((a, b) => a - b);
        this.bucketCounts = new Array(this.sortedBuckets.length).fill(0);
    }
    observe(value) {
        if (typeof value !== 'number' || isNaN(value)) {
            throw new Error('Observation value must be a valid number');
        }
        this.totalCount++;
        this.totalSum += value;
        for (let i = 0; i < this.sortedBuckets.length; i++) {
            if (value <= this.sortedBuckets[i]) {
                this.bucketCounts[i]++;
            }
        }
        this.infCount++;
    }
    getCount() {
        return this.totalCount;
    }
    getSum() {
        return this.totalSum;
    }
    getBucketCounts() {
        const result = this.sortedBuckets.map((le, idx) => ({
            le,
            count: this.bucketCounts[idx]
        }));
        result.push({ le: '+Inf', count: this.infCount });
        return result;
    }
    reset() {
        this.bucketCounts.fill(0);
        this.infCount = 0;
        this.totalCount = 0;
        this.totalSum = 0;
    }
    toPrometheus() {
        const lines = [
            `# HELP ${this.name} ${this.help}`,
            `# TYPE ${this.name} histogram`
        ];
        for (let i = 0; i < this.sortedBuckets.length; i++) {
            lines.push(`${this.name}_bucket{le="${this.sortedBuckets[i]}"} ${this.bucketCounts[i]}`);
        }
        lines.push(`${this.name}_bucket{le="+Inf"} ${this.infCount}`);
        lines.push(`${this.name}_sum ${this.totalSum}`);
        lines.push(`${this.name}_count ${this.totalCount}`);
        return lines.join('\n') + '\n';
    }
}
//# sourceMappingURL=histogram_bucket_collector.js.map