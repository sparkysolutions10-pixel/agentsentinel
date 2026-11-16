/**
 * AgentSentinel - Historical Gas Spike Sliding Window Averager
 * Computes rolling mean and standard deviation across recent ledger fee samples
 * to detect statistical anomalies and fee regime transitions.
 */
export declare class HistoricalGasSpikeAverager {
    private windowSize;
    private samples;
    constructor(windowSize?: number);
    addSample(fee: number): void;
    getMean(): number;
    getStandardDeviation(): number;
    isAnomaly(fee: number, sigmaThreshold?: number): boolean;
}
//# sourceMappingURL=historical_gas_averager.d.ts.map