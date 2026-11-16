export interface MetricRecord {
    timestamp: number;
    metric: string;
    value: number;
    tags?: Record<string, string>;
}
export declare class CsvMetricsExporter {
    static export(records: MetricRecord[]): string;
}
//# sourceMappingURL=csv_metrics_exporter.d.ts.map