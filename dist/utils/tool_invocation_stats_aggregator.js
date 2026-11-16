export class ToolInvocationStatsAggregator {
    stats = new Map();
    record(toolName, durationMs, isError = false) {
        const current = this.stats.get(toolName) || { calls: 0, errors: 0, totalDurationMs: 0 };
        current.calls++;
        if (isError)
            current.errors++;
        current.totalDurationMs += durationMs;
        this.stats.set(toolName, current);
    }
    getStats(toolName) {
        const s = this.stats.get(toolName);
        if (!s)
            return null;
        return {
            calls: s.calls,
            errors: s.errors,
            totalDurationMs: s.totalDurationMs,
            avgDurationMs: s.calls > 0 ? s.totalDurationMs / s.calls : 0
        };
    }
}
//# sourceMappingURL=tool_invocation_stats_aggregator.js.map