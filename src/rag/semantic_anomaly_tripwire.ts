import { SentinelRule, ToolCallContext, RuleViolation, Verdict } from '../types.js';

export function createSemanticAnomalyTripwireRule(minScore: number = -0.5, maxScore: number = 2.5): SentinelRule {
  return {
    id: 'rag-semantic-anomaly-tripwire',
    name: 'Detect Semantic Distance Anomalies and Score Hijacking',
    category: 'custom',
    priority: 850,
    enabled: true,
    evaluate: (ctx: ToolCallContext): RuleViolation | null => {
      const distance = ctx.params?.distance ?? ctx.params?.score;
      if (typeof distance === 'number') {
        if (distance < minScore || distance > maxScore || Number.isNaN(distance)) {
          return {
            ruleId: 'rag-semantic-anomaly-tripwire',
            ruleName: 'Detect Semantic Distance Anomalies and Score Hijacking',
            severity: 'high',
            verdict: Verdict.BLOCK,
            reason: `Semantic distance score ${distance} is outside plausible range [${minScore}, ${maxScore}].`,
            detectedPattern: `anomalous-distance=${distance}`,
          };
        }
      }
      return null;
    }
  };
}
