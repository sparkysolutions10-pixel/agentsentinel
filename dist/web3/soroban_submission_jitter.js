/**
 * AgentSentinel - Transaction Submission Retry Jitter & Exponential Backoff
 * Prevents thundering herd problems on Stellar ledger closes by enforcing randomized jitter
 * and exponential spacing between transaction rebroadcasts.
 */
import { Verdict } from '../types.js';
export function createSorobanSubmissionJitterRule(config = {}) {
    const minInterval = config.minIntervalMs ?? 500;
    const baseJitter = config.baseJitterMs ?? 200;
    return {
        id: 'soroban-submission-jitter',
        name: 'Soroban Submission Jitter & Backoff',
        category: 'custom',
        priority: 78,
        enabled: true,
        evaluate(context) {
            const tool = context.toolName.toLowerCase();
            if (!tool.includes('submit') && !tool.includes('broadcast') && !tool.includes('retry') && !tool.includes('soroban')) {
                return null;
            }
            const params = context.params || {};
            const retryCount = Number(params.retryCount || 0);
            const timeSinceLastAttemptMs = Number(params.timeSinceLastAttemptMs || 0);
            if (retryCount > 0) {
                const requiredDelay = minInterval * Math.pow(1.5, Math.min(retryCount, 5));
                if (timeSinceLastAttemptMs < requiredDelay) {
                    const suggestedJitter = Math.floor(Math.random() * baseJitter);
                    return {
                        ruleId: 'soroban-submission-jitter',
                        ruleName: 'Soroban Submission Jitter & Backoff',
                        severity: 'medium',
                        verdict: Verdict.BLOCK,
                        reason: `Transaction retry #${retryCount} attempted too rapidly (${timeSinceLastAttemptMs}ms < required ${Math.round(requiredDelay)}ms). Must apply exponential backoff + jitter to avoid thundering herd.`,
                        detectedPattern: `RAPID_RETRY_UNJITTERED:${timeSinceLastAttemptMs}<${Math.round(requiredDelay)}`,
                    };
                }
            }
            return null;
        }
    };
}
//# sourceMappingURL=soroban_submission_jitter.js.map