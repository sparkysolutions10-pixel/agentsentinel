/**
 * AgentSentinel - Qdrant Vector Distance Metric Sanity Checker Rule.
 * Validates distance metric configurations (Cosine, Euclid, Dot) and prevents metric mismatch and score poisoning.
 */

import { SentinelRule, ToolCallContext, RuleViolation, Verdict } from '../types.js';

export interface QdrantDistanceMetricCheckerOptions {
  allowedMetrics?: string[];
}

const VALID_METRICS = new Set(['cosine', 'euclid', 'dot', 'manhattan']);

export function inspectDistanceMetric(
  params: Record<string, any>,
  allowedMetrics?: string[]
): { isValid: boolean; violationReason?: string; detectedPattern?: string } {
  if (!params || typeof params !== 'object') {
    return { isValid: true };
  }

  const metric = params.distance ?? params.metric ?? params.distance_metric;
  if (metric !== undefined) {
    if (typeof metric !== 'string') {
      return {
        isValid: false,
        violationReason: `Distance metric must be a valid string identifier. Received: ${typeof metric}.`,
        detectedPattern: String(metric),
      };
    }

    const normalized = metric.trim().toLowerCase();
    const effectiveAllowed = allowedMetrics ? new Set(allowedMetrics.map(m => m.toLowerCase())) : VALID_METRICS;

    if (!effectiveAllowed.has(normalized)) {
      return {
        isValid: false,
        violationReason: `Unknown or disallowed vector distance metric: "${metric}". Expected one of: ${Array.from(effectiveAllowed).join(', ')}.`,
        detectedPattern: metric,
      };
    }
  }

  // Check score bounds if threshold or score is passed
  const scoreThreshold = params.score_threshold ?? params.threshold;
  if (scoreThreshold !== undefined) {
    if (typeof scoreThreshold !== 'number' || Number.isNaN(scoreThreshold) || !Number.isFinite(scoreThreshold)) {
      return {
        isValid: false,
        violationReason: `Invalid score threshold: "${String(scoreThreshold)}". Non-finite or NaN scores are prohibited.`,
        detectedPattern: `score_threshold=${scoreThreshold}`,
      };
    }
  }

  return { isValid: true };
}

export function createQdrantDistanceMetricCheckerRule(
  options: QdrantDistanceMetricCheckerOptions = {}
): SentinelRule {
  return {
    id: 'rag-qdrant-distance-checker',
    name: 'Sanitize and Validate Vector Distance Metrics and Score Thresholds',
    category: 'custom',
    priority: 940,
    enabled: true,
    evaluate: (ctx: ToolCallContext): RuleViolation | null => {
      const hasMetric =
        ctx.params &&
        (ctx.params.distance !== undefined ||
          ctx.params.metric !== undefined ||
          ctx.params.distance_metric !== undefined ||
          ctx.params.score_threshold !== undefined ||
          ctx.params.threshold !== undefined);

      if (!hasMetric) return null;

      const inspection = inspectDistanceMetric(ctx.params, options.allowedMetrics);
      if (!inspection.isValid) {
        return {
          ruleId: 'rag-qdrant-distance-checker',
          ruleName: 'Sanitize and Validate Vector Distance Metrics and Score Thresholds',
          severity: 'high',
          verdict: Verdict.BLOCK,
          reason: inspection.violationReason || 'Invalid distance metric configuration.',
          detectedPattern: inspection.detectedPattern,
        };
      }

      return null;
    },
  };
}

export const qdrantDistanceMetricCheckerRule: SentinelRule = createQdrantDistanceMetricCheckerRule();
