/**
 * AgentSentinel - Historical Gas Spike Sliding Window Averager
 * Computes rolling mean and standard deviation across recent ledger fee samples
 * to detect statistical anomalies and fee regime transitions.
 */

export class HistoricalGasSpikeAverager {
  private windowSize: number;
  private samples: number[] = [];

  constructor(windowSize = 20) {
    this.windowSize = windowSize;
  }

  public addSample(fee: number): void {
    if (fee <= 0 || isNaN(fee)) return;
    this.samples.push(fee);
    if (this.samples.length > this.windowSize) {
      this.samples.shift();
    }
  }

  public getMean(): number {
    if (this.samples.length === 0) return 0;
    const sum = this.samples.reduce((a, b) => a + b, 0);
    return sum / this.samples.length;
  }

  public getStandardDeviation(): number {
    if (this.samples.length < 2) return 0;
    const mean = this.getMean();
    const variance = this.samples.reduce((sq, n) => sq + Math.pow(n - mean, 2), 0) / (this.samples.length - 1);
    return Math.sqrt(variance);
  }

  public isAnomaly(fee: number, sigmaThreshold = 2.0): boolean {
    if (this.samples.length < 5) return false;
    const mean = this.getMean();
    const stdDev = this.getStandardDeviation();
    if (stdDev === 0) return false;
    return fee > mean + (stdDev * sigmaThreshold);
  }
}
