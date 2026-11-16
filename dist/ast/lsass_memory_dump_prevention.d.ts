/**
 * Auto-generated Enterprise Security Invariant: Issue #1897
 * Title: feat(ast): implement AST blocker halting procdump and comsvcs.dll memory dumping of lsass.exe
 */
export declare class LsassMemoryDumpPrevention {
    private static readonly INVARIANT_NAME;
    static inspect(payload: string): {
        isThreat: boolean;
        invariant: string;
        latencyMs: number;
    };
    static validate(input: string): boolean;
}
//# sourceMappingURL=lsass_memory_dump_prevention.d.ts.map