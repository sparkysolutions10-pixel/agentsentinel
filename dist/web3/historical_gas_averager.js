/**
 * AgentSentinel - Historical Gas Spike Sliding Window Averager
 * Computes rolling mean and standard deviation across recent ledger fee samples
 * to detect statistical anomalies and fee regime transitions.
 */
export class HistoricalGasSpikeAverager {
    windowSize;
    samples = [];
    constructor(windowSize = 20) {
        this.windowSize = windowSize;
    }
    addSample(fee) {
        if (fee <= 0 || isNaN(fee))
            return;
        this.samples.push(fee);
        if (this.samples.length > this.windowSize) {
            this.samples.shift();
        }
    }
    getMean() {
        if (this.samples.length === 0)
            return 0;
        const sum = this.samples.reduce((a, b) => a + b, 0);
        return sum / this.samples.length;
    }
    getStandardDeviation() {
        if (this.samples.length < 2)
            return 0;
        const mean = this.getMean();
        const variance = this.samples.reduce((sq, n) => sq + Math.pow(n - mean, 2), 0) / (this.samples.length - 1);
        return Math.sqrt(variance);
    }
    isAnomaly(fee, sigmaThreshold = 2.0) {
        if (this.samples.length < 5)
            return false;
        const mean = this.getMean();
        const stdDev = this.getStandardDeviation();
        if (stdDev === 0)
            return false;
        return fee > mean + (stdDev * sigmaThreshold);
    }
}
//# sourceMappingURL=historical_gas_averager.js.map