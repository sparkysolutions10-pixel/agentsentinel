export interface ToolStats {
  calls: number;
  errors: number;
  totalDurationMs: number;
  avgDurationMs: number;
}

export class ToolInvocationStatsAggregator {
  private stats: Map<string, { calls: number; errors: number; totalDurationMs: number }> = new Map();

  public record(toolName: string, durationMs: number, isError: boolean = false): void {
    const current = this.stats.get(toolName) || { calls: 0, errors: 0, totalDurationMs: 0 };
    current.calls++;
    if (isError) current.errors++;
    current.totalDurationMs += durationMs;
    this.stats.set(toolName, current);
  }

  public getStats(toolName: string): ToolStats | null {
    const s = this.stats.get(toolName);
    if (!s) return null;
    return {
      calls: s.calls,
      errors: s.errors,
      totalDurationMs: s.totalDurationMs,
      avgDurationMs: s.calls > 0 ? s.totalDurationMs / s.calls : 0
    };
  }
}
