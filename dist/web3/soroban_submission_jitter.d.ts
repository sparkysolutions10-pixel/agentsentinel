/**
 * AgentSentinel - Transaction Submission Retry Jitter & Exponential Backoff
 * Prevents thundering herd problems on Stellar ledger closes by enforcing randomized jitter
 * and exponential spacing between transaction rebroadcasts.
 */
import { SentinelRule } from '../types.js';
export interface SorobanSubmissionJitterConfig {
    minIntervalMs?: number;
    baseJitterMs?: number;
}
export declare function createSorobanSubmissionJitterRule(config?: SorobanSubmissionJitterConfig): SentinelRule;
//# sourceMappingURL=soroban_submission_jitter.d.ts.map