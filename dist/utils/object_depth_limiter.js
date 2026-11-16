/**
 * AgentSentinel - Object Depth Limiter Utility
 * Calculates JSON object nesting depth and prevents deeply recursive DoS attacks.
 */
export class ObjectDepthLimiter {
    static calculateDepth(obj, currentDepth = 1) {
        if (obj === null || typeof obj !== 'object') {
            return currentDepth;
        }
        let maxDepth = currentDepth;
        const entries = Object.values(obj);
        for (const val of entries) {
            if (val !== null && typeof val === 'object') {
                const d = this.calculateDepth(val, currentDepth + 1);
                if (d > maxDepth)
                    maxDepth = d;
            }
        }
        return maxDepth;
    }
    static isWithinMaxDepth(obj, maxDepth = 5) {
        return this.calculateDepth(obj) <= maxDepth;
    }
}
//# sourceMappingURL=object_depth_limiter.js.map