/**
 * HistogramBucketCollector - Cumulative bucket histogram for latency and distribution tracking.
 */

export interface BucketCount {
  le: number | '+Inf';
  count: number;
}

export class HistogramBucketCollector {
  public readonly sortedBuckets: number[];
  private bucketCounts: number[];
  private infCount: number = 0;
  private totalCount: number = 0;
  private totalSum: number = 0;

  constructor(
    public readonly name: string,
    public readonly help: string,
    buckets: number[] = [5, 10, 25, 50, 100, 250, 500, 1000]
  ) {
    if (!name || !/^[a-zA-Z_:][a-zA-Z0-9_:]*$/.test(name)) {
      throw new Error(`Invalid metric name: ${name}`);
    }
    this.sortedBuckets = [...new Set(buckets)].sort((a, b) => a - b);
    this.bucketCounts = new Array(this.sortedBuckets.length).fill(0);
  }

  public observe(value: number): void {
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

  public getCount(): number {
    return this.totalCount;
  }

  public getSum(): number {
    return this.totalSum;
  }

  public getBucketCounts(): BucketCount[] {
    const result: BucketCount[] = this.sortedBuckets.map((le, idx) => ({
      le,
      count: this.bucketCounts[idx]
    }));
    result.push({ le: '+Inf', count: this.infCount });
    return result;
  }

  public reset(): void {
    this.bucketCounts.fill(0);
    this.infCount = 0;
    this.totalCount = 0;
    this.totalSum = 0;
  }

  public toPrometheus(): string {
    const lines: string[] = [
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
