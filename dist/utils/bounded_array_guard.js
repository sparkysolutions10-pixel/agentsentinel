/**
 * AgentSentinel - Bounded Array Guard Utility
 * Enforces minimum and maximum element constraints on array parameters.
 */
export class BoundedArrayGuard {
    static isWithinBounds(arr, min = 0, max = 100) {
        if (!Array.isArray(arr))
            return false;
        return arr.length >= min && arr.length <= max;
    }
    static clampArray(arr, max = 100) {
        if (!Array.isArray(arr))
            return [];
        if (arr.length <= max)
            return arr;
        return arr.slice(0, max);
    }
}
//# sourceMappingURL=bounded_array_guard.js.map