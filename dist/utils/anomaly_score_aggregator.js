/**
 * AnomalyScoreAggregator - Composite anomaly score aggregator (0 - 100).
 */
export class AnomalyScoreAggregator {
    static calculateCompositeScore(signals) {
        const weights = {
            prompt: 0.35,
            param: 0.25,
            velocity: 0.20,
            target: 0.20
        };
        const prompt = Math.max(0, Math.min(100, signals.promptRiskScore ?? 0));
        const param = Math.max(0, Math.min(100, signals.toolParamDivergence ?? 0));
        const velocity = Math.max(0, Math.min(100, signals.requestVelocityRisk ?? 0));
        const target = Math.max(0, Math.min(100, signals.unusualTargetRisk ?? 0));
        const composite = (prompt * weights.prompt +
            param * weights.param +
            velocity * weights.velocity +
            target * weights.target);
        return Math.round(composite);
    }
    static getThreatBand(score) {
        if (score >= 80)
            return 'CRITICAL';
        if (score >= 60)
            return 'HIGH';
        if (score >= 30)
            return 'MEDIUM';
        return 'LOW';
    }
}
//# sourceMappingURL=anomaly_score_aggregator.js.map