export class PercentileCalculator {
  public static calculate(values: number[], percentile: number): number {
    if (!Array.isArray(values) || values.length === 0) return 0;
    if (percentile <= 0) return Math.min(...values);
    if (percentile >= 100) return Math.max(...values);

    const sorted = [...values].sort((a, b) => a - b);
    const index = (percentile / 100) * (sorted.length - 1);
    const lower = Math.floor(index);
    const upper = Math.ceil(index);
    const weight = index - lower;

    return sorted[lower] * (1 - weight) + sorted[upper] * weight;
  }
}
