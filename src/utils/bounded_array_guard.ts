/**
 * AgentSentinel - Bounded Array Guard Utility
 * Enforces minimum and maximum element constraints on array parameters.
 */

export class BoundedArrayGuard {
  public static isWithinBounds(arr: unknown, min: number = 0, max: number = 100): boolean {
    if (!Array.isArray(arr)) return false;
    return arr.length >= min && arr.length <= max;
  }

  public static clampArray<T>(arr: T[], max: number = 100): T[] {
    if (!Array.isArray(arr)) return [];
    if (arr.length <= max) return arr;
    return arr.slice(0, max);
  }
}
