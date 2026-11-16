/**
 * GaugeMetricCollector - Value metric that can increase and decrease, tracking min/max.
 */
export interface GaugeMetricLabels {
    [key: string]: string;
}
export interface GaugeEntry {
    current: number;
    min: number;
    max: number;
}
export declare class GaugeMetricCollector {
    readonly name: string;
    readonly help: string;
    readonly labelNames: string[];
    private gauges;
    constructor(name: string, help: string, labelNames?: string[]);
    private serializeLabels;
    set(value: number, labels?: GaugeMetricLabels): void;
    inc(amount?: number, labels?: GaugeMetricLabels): void;
    dec(amount?: number, labels?: GaugeMetricLabels): void;
    get(labels?: GaugeMetricLabels): number;
    getMin(labels?: GaugeMetricLabels): number;
    getMax(labels?: GaugeMetricLabels): number;
    reset(): void;
    toPrometheus(): string;
}
//# sourceMappingURL=gauge_metric_collector.d.ts.map