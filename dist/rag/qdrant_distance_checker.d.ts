/**
 * AgentSentinel - Qdrant Vector Distance Metric Sanity Checker Rule.
 * Validates distance metric configurations (Cosine, Euclid, Dot) and prevents metric mismatch and score poisoning.
 */
import { SentinelRule } from '../types.js';
export interface QdrantDistanceMetricCheckerOptions {
    allowedMetrics?: string[];
}
export declare function inspectDistanceMetric(params: Record<string, any>, allowedMetrics?: string[]): {
    isValid: boolean;
    violationReason?: string;
    detectedPattern?: string;
};
export declare function createQdrantDistanceMetricCheckerRule(options?: QdrantDistanceMetricCheckerOptions): SentinelRule;
export declare const qdrantDistanceMetricCheckerRule: SentinelRule;
//# sourceMappingURL=qdrant_distance_checker.d.ts.map