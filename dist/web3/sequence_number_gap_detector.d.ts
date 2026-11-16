/**
 * AgentSentinel - Stellar Sequence Number Gap & Stale Nonce Detector
 * Enforces strictly monotonic sequence progression (N+1) to prevent
 * transaction starvation, nonce collisions, and out-of-order rejections.
 */
import { SentinelRule } from '../types.js';
export interface SequenceNumberGapConfig {
    maxAllowedGap?: number;
}
export declare function createSequenceNumberGapRule(config?: SequenceNumberGapConfig): SentinelRule;
//# sourceMappingURL=sequence_number_gap_detector.d.ts.map