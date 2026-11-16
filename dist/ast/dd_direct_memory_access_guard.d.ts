/**
 * Auto-generated Enterprise Security Invariant: Issue #1875
 * Title: feat(ast): implement AST guard preventing dd writes to /dev/mem and /dev/kmem
 */
export declare class DdDirectMemoryAccessGuard {
    private static readonly INVARIANT_NAME;
    static inspect(payload: string): {
        isThreat: boolean;
        invariant: string;
        latencyMs: number;
    };
    static validate(input: string): boolean;
}
//# sourceMappingURL=dd_direct_memory_access_guard.d.ts.map