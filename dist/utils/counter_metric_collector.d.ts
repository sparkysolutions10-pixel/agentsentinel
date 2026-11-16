/**
 * CounterMetricCollector - Monotonically increasing counter with Prometheus exposition.
 */
export interface MetricLabels {
    [key: string]: string;
}
export declare class CounterMetricCollector {
    readonly name: string;
    readonly help: string;
    readonly labelNames: string[];
    private counts;
    constructor(name: string, help: string, labelNames?: string[]);
    private serializeLabels;
    inc(labelsOrAmount?: MetricLabels | number, amount?: number): void;
    get(labels?: MetricLabels): number;
    reset(): void;
    toPrometheus(): string;
}
//# sourceMappingURL=counter_metric_collector.d.ts.map