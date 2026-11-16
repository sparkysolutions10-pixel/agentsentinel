/**
 * AgentSentinel - Cross-Contract Invocation Call Depth Limiter
 * Restricts nested contract-to-contract invocation call depth (< 8 default)
 * to prevent call-stack exhaustion, recursive loops, and unbounded host gas consumption.
 */
import { SentinelRule } from '../types.js';
export interface SorobanCallDepthConfig {
    maxCallDepth?: number;
}
export declare function createSorobanCallDepthLimiterRule(config?: SorobanCallDepthConfig): SentinelRule;
//# sourceMappingURL=soroban_call_depth_limiter.d.ts.map