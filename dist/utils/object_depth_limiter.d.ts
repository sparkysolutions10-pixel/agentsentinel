/**
 * AgentSentinel - Object Depth Limiter Utility
 * Calculates JSON object nesting depth and prevents deeply recursive DoS attacks.
 */
export declare class ObjectDepthLimiter {
    static calculateDepth(obj: unknown, currentDepth?: number): number;
    static isWithinMaxDepth(obj: unknown, maxDepth?: number): boolean;
}
//# sourceMappingURL=object_depth_limiter.d.ts.map