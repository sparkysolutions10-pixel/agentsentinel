/**
 * AgentSentinel - Horizon REST API Request Rate Limiter and Backoff
 * Throttles outbound Horizon calls to prevent HTTP 429 rate limit bans
 * and paces burst queries from autonomous multi-agent systems.
 */
import { Verdict } from '../types.js';
export function createSorobanHorizonRateLimiterRule(config = {}) {
    const maxPerMin = config.maxRequestsPerMinute ?? 60;
    const burstLimit = config.burstLimit ?? 10;
    let recentTimestamps = [];
    return {
        id: 'soroban-horizon-rate-limiter',
        name: 'Horizon REST API Rate Limiter',
        category: 'custom',
        priority: 75,
        enabled: true,
        evaluate(context) {
            const tool = context.toolName.toLowerCase();
            if (!tool.includes('horizon') && !tool.includes('stellar_api') && !tool.includes('account_query')) {
                return null;
            }
            const now = Date.now();
            recentTimestamps = recentTimestamps.filter(t => now - t < 60000);
            // Check remaining header from previous calls if passed
            const params = context.params || {};
            const rateLimitRemaining = params.rateLimitRemaining !== undefined ? Number(params.rateLimitRemaining) : null;
            if (rateLimitRemaining !== null && rateLimitRemaining <= 0) {
                return {
                    ruleId: 'soroban-horizon-rate-limiter',
                    ruleName: 'Horizon REST API Rate Limiter',
                    severity: 'high',
                    verdict: Verdict.BLOCK,
                    reason: 'Horizon HTTP 429 rate limit exceeded. Must back off until rate-limit window resets.',
                    detectedPattern: 'HORIZON_RATE_LIMIT_EXHAUSTED:0_REMAINING',
                };
            }
            if (recentTimestamps.length >= maxPerMin) {
                return {
                    ruleId: 'soroban-horizon-rate-limiter',
                    ruleName: 'Horizon REST API Rate Limiter',
                    severity: 'medium',
                    verdict: Verdict.BLOCK,
                    reason: `Outbound Horizon request volume (${recentTimestamps.length}/min) reached maximum quota (${maxPerMin}/min). Throttling required.`,
                    detectedPattern: `HORIZON_QUOTA_EXCEEDED:${recentTimestamps.length}>=${maxPerMin}`,
                };
            }
            recentTimestamps.push(now);
            return null;
        }
    };
}
//# sourceMappingURL=soroban_horizon_rate_limiter.js.map