/**
 * AgentSentinel - Horizon REST API Request Rate Limiter and Backoff
 * Throttles outbound Horizon calls to prevent HTTP 429 rate limit bans
 * and paces burst queries from autonomous multi-agent systems.
 */
import { SentinelRule } from '../types.js';
export interface SorobanHorizonRateLimitConfig {
    maxRequestsPerMinute?: number;
    burstLimit?: number;
}
export declare function createSorobanHorizonRateLimiterRule(config?: SorobanHorizonRateLimitConfig): SentinelRule;
//# sourceMappingURL=soroban_horizon_rate_limiter.d.ts.map