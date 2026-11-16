/**
 * Auto-generated Enterprise Security Invariant: Issue #1881
 * Title: feat(ast): implement ulimit -c 0 enforcement preventing unredacted core dump exports
 */
export declare class CoreDumpUnredactedMemoryBlocker {
    private static readonly INVARIANT_NAME;
    static inspect(payload: string): {
        isThreat: boolean;
        invariant: string;
        latencyMs: number;
    };
    static validate(input: string): boolean;
}
//# sourceMappingURL=core_dump_unredacted_memory_blocker.d.ts.map