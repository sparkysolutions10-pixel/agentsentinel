/**
 * Auto-generated Enterprise Security Invariant: Issue #1895
 * Title: feat(ast): implement Windows API call monitor detecting CreateProcess with suspended flag
 */
export declare class ProcessHollowingMemoryGuard {
    private static readonly INVARIANT_NAME;
    static inspect(payload: string): {
        isThreat: boolean;
        invariant: string;
        latencyMs: number;
    };
    static validate(input: string): boolean;
}
//# sourceMappingURL=process_hollowing_memory_guard.d.ts.map