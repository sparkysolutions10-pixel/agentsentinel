export class HealthScoreCalculator {
  public static calculate(errorRatePercent: number, p99LatencyMs: number): number {
    let score = 100;
    score -= Math.min(60, errorRatePercent * 3);
    if (p99LatencyMs > 1000) {
      score -= Math.min(40, (p99LatencyMs - 1000) / 100);
    }
    return Math.max(0, Math.round(score));
  }
}
