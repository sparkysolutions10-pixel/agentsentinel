export declare class BranchlessEvaluator {
    /**
     * Branchless equality check between two numbers (0 or 1 result).
     * Uses bitwise XOR and shift operations without conditional branches.
     */
    static equals32(a: number, b: number): number;
    /**
     * Branchless conditional select: returns x when condition is 1, y when condition is 0.
     */
    static select32(condition: number, x: number, y: number): number;
    /**
     * Branchless constant-time buffer equivalence using cumulative bitwise OR.
     */
    static constantTimeCompare(a: Uint8Array, b: Uint8Array): number;
}
//# sourceMappingURL=branchless_evaluator.d.ts.map