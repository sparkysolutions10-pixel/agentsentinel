/**
 * AgentSentinel - Bounded Array Guard Utility
 * Enforces minimum and maximum element constraints on array parameters.
 */
export declare class BoundedArrayGuard {
    static isWithinBounds(arr: unknown, min?: number, max?: number): boolean;
    static clampArray<T>(arr: T[], max?: number): T[];
}
//# sourceMappingURL=bounded_array_guard.d.ts.map