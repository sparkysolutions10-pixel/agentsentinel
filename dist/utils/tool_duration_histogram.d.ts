/**
 * ToolDurationHistogram - Execution latency tracker with percentile distributions.
 */
export interface DurationStats {
    count: number;
    min: number;
    max: number;
    avg: number;
    p50: number;
    p90: number;
    p95: number;
    p99: number;
}
export declare class ToolDurationHistogram {
    private toolDurations;
    record(toolName: string, durationMs: number): void;
    private calculatePercentile;
    getStats(toolName: string): DurationStats | null;
    getAllStats(): Record<string, DurationStats>;
    reset(toolName?: string): void;
}
//# sourceMappingURL=tool_duration_histogram.d.ts.map