export interface ToolStats {
    calls: number;
    errors: number;
    totalDurationMs: number;
    avgDurationMs: number;
}
export declare class ToolInvocationStatsAggregator {
    private stats;
    record(toolName: string, durationMs: number, isError?: boolean): void;
    getStats(toolName: string): ToolStats | null;
}
//# sourceMappingURL=tool_invocation_stats_aggregator.d.ts.map