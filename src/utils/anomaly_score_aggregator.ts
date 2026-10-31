/**
 * AnomalyScoreAggregator - Composite anomaly score aggregator (0 - 100).
 */

export interface ThreatSignals {
  promptRiskScore?: number;      // 0 - 100
  toolParamDivergence?: number;  // 0 - 100
  requestVelocityRisk?: number;  // 0 - 100
  unusualTargetRisk?: number;    // 0 - 100
}

export class AnomalyScoreAggregator {
  public static calculateCompositeScore(signals: ThreatSignals): number {
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

    const composite = (
      prompt * weights.prompt +
      param * weights.param +
      velocity * weights.velocity +
      target * weights.target
    );

    return Math.round(composite);
  }

  public static getThreatBand(score: number): 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL' {
    if (score >= 80) return 'CRITICAL';
    if (score >= 60) return 'HIGH';
    if (score >= 30) return 'MEDIUM';
    return 'LOW';
  }
}
