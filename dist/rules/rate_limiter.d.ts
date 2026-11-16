/**
 * AgentSentinel Circular Tool Execution Loop & Rate Limiter Rule.
 * Detects and breaks infinite agent loops, repeated identical tool invocations,
 * and runaway execution spirals in autonomous agents.
 */
import { SentinelRule, ToolCallContext, RuleViolation } from '../types.js';
export interface LoopRateLimiterOptions {
    maxConsecutiveIdenticalCalls?: number;
    slidingWindowMs?: number;
    maxCallsPerWindow?: number;
    action?: 'BLOCK' | 'CONFIRM';
    ignoreTools?: string[];
}
export interface ToolCallFingerprintRecord {
    toolName: string;
    fingerprint: string;
    timestamp: number;
}
/**
 * Deterministically serializes parameters into a canonical JSON string for fingerprinting.
 */
export declare function canonicalizeParams(params: Record<string, any>): string;
export declare class ToolLoopRateLimiter {
    private maxConsecutive;
    private slidingWindowMs;
    private maxPerWindow;
    private action;
    private ignoreTools;
    private lastFingerprint;
    private consecutiveCount;
    private callHistory;
    constructor(options?: LoopRateLimiterOptions);
    /**
     * Resets internal tracking history.
     */
    reset(): void;
    /**
     * Evaluates a tool call context against loop and rate limits.
     */
    evaluateContext(ctx: ToolCallContext): RuleViolation | null;
    /**
     * Creates an AgentSentinel SentinelRule for loop rate limiting.
     */
    createSentinelRule(): SentinelRule;
}
/**
 * Convenience helper creating the standard rate limiter rule.
 */
export declare function createLoopRateLimiterRule(options?: LoopRateLimiterOptions): SentinelRule;
export declare const loopRateLimiterRule: SentinelRule;
//# sourceMappingURL=rate_limiter.d.ts.map