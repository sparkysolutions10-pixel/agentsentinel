/**
 * AgentSentinel - Object Depth Limiter Utility
 * Calculates JSON object nesting depth and prevents deeply recursive DoS attacks.
 */

export class ObjectDepthLimiter {
  public static calculateDepth(obj: unknown, currentDepth: number = 1): number {
    if (obj === null || typeof obj !== 'object') {
      return currentDepth;
    }

    let maxDepth = currentDepth;
    const entries = Object.values(obj as Record<string, unknown>);

    for (const val of entries) {
      if (val !== null && typeof val === 'object') {
        const d = this.calculateDepth(val, currentDepth + 1);
        if (d > maxDepth) maxDepth = d;
      }
    }

    return maxDepth;
  }

  public static isWithinMaxDepth(obj: unknown, maxDepth: number = 5): boolean {
    return this.calculateDepth(obj) <= maxDepth;
  }
}
