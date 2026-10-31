import { describe, it, expect } from 'vitest';
import { AnomalyScoreAggregator } from '../src/utils/anomaly_score_aggregator.js';

describe('AnomalyScoreAggregator', () => {
  it('calculates weighted composite score', () => {
    const score = AnomalyScoreAggregator.calculateCompositeScore({
      promptRiskScore: 100,
      toolParamDivergence: 0,
      requestVelocityRisk: 0,
      unusualTargetRisk: 0
    });
    expect(score).toBe(35);
  });

  it('determines threat bands accurately', () => {
    expect(AnomalyScoreAggregator.getThreatBand(15)).toBe('LOW');
    expect(AnomalyScoreAggregator.getThreatBand(45)).toBe('MEDIUM');
    expect(AnomalyScoreAggregator.getThreatBand(75)).toBe('HIGH');
    expect(AnomalyScoreAggregator.getThreatBand(90)).toBe('CRITICAL');
  });
});
