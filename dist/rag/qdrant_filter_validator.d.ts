/**
 * AgentSentinel - Qdrant Search Payload Filter Validator Rule.
 * Inspects and sanitizes nested payload filter conditions in Qdrant vector queries.
 * Prevents recursive DoS attacks (> 5 levels) and prototype pollution vectors.
 */
import { SentinelRule } from '../types.js';
export interface QdrantFilterValidatorOptions {
    maxFilterDepth?: number;
}
export declare function inspectQdrantFilter(filter: any, options?: QdrantFilterValidatorOptions): {
    isValid: boolean;
    violationReason?: string;
    detectedPattern?: string;
};
export declare function createQdrantFilterValidatorRule(options?: QdrantFilterValidatorOptions): SentinelRule;
export declare const qdrantFilterValidatorRule: SentinelRule;
//# sourceMappingURL=qdrant_filter_validator.d.ts.map