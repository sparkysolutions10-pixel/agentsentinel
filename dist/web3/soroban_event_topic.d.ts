/**
 * AgentSentinel - Contract Event Topic Schema Validator
 * Validates Soroban event topics against schema rules (max 4 topic segments, non-empty, valid symbols)
 * to intercept spoofed or malformed telemetry feeds.
 */
import { SentinelRule } from '../types.js';
export interface SorobanEventTopicConfig {
    maxTopicsCount?: number;
}
export declare function createSorobanEventTopicValidatorRule(config?: SorobanEventTopicConfig): SentinelRule;
//# sourceMappingURL=soroban_event_topic.d.ts.map