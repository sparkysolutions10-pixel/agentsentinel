/**
 * AnomalyScoreAggregator - Composite anomaly score aggregator (0 - 100).
 */
export interface ThreatSignals {
    promptRiskScore?: number;
    toolParamDivergence?: number;
    requestVelocityRisk?: number;
    unusualTargetRisk?: number;
}
export declare class AnomalyScoreAggregator {
    static calculateCompositeScore(signals: ThreatSignals): number;
    static getThreatBand(score: number): 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
}
//# sourceMappingURL=anomaly_score_aggregator.d.ts.map