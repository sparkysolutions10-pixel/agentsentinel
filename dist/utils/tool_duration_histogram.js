/**
 * ToolDurationHistogram - Execution latency tracker with percentile distributions.
 */
export class ToolDurationHistogram {
    toolDurations = new Map();
    record(toolName, durationMs) {
        if (typeof durationMs !== 'number' || durationMs < 0 || isNaN(durationMs)) {
            throw new Error('Duration must be a non-negative number');
        }
        const list = this.toolDurations.get(toolName) ?? [];
        list.push(durationMs);
        this.toolDurations.set(toolName, list);
    }
    calculatePercentile(sorted, p) {
        if (sorted.length === 0)
            return 0;
        const index = Math.ceil((p / 100) * sorted.length) - 1;
        return sorted[Math.max(0, Math.min(index, sorted.length - 1))];
    }
    getStats(toolName) {
        const list = this.toolDurations.get(toolName);
        if (!list || list.length === 0)
            return null;
        const sorted = [...list].sort((a, b) => a - b);
        const count = sorted.length;
        const sum = sorted.reduce((a, b) => a + b, 0);
        const avg = Number((sum / count).toFixed(2));
        return {
            count,
            min: sorted[0],
            max: sorted[count - 1],
            avg,
            p50: this.calculatePercentile(sorted, 50),
            p90: this.calculatePercentile(sorted, 90),
            p95: this.calculatePercentile(sorted, 95),
            p99: this.calculatePercentile(sorted, 99)
        };
    }
    getAllStats() {
        const res = {};
        for (const tool of this.toolDurations.keys()) {
            const stats = this.getStats(tool);
            if (stats)
                res[tool] = stats;
        }
        return res;
    }
    reset(toolName) {
        if (toolName) {
            this.toolDurations.delete(toolName);
        }
        else {
            this.toolDurations.clear();
        }
    }
}
//# sourceMappingURL=tool_duration_histogram.js.map