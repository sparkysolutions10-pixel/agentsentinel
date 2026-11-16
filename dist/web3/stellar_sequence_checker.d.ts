/**
 * AgentSentinel - Source Account Sequence Number Anti-Desync Checker
 * Tracks and validates sequence numbers to prevent transaction failures
 * caused by sequence gaps, stale sequences, or desynchronized multi-agent submissions.
 */
import { SentinelRule } from '../types.js';
export interface StellarSequenceCheckerConfig {
    maxAllowedSequenceGap?: number;
}
export declare function createStellarSequenceCheckerRule(config?: StellarSequenceCheckerConfig): SentinelRule;
//# sourceMappingURL=stellar_sequence_checker.d.ts.map