/**
 * Auto-generated Enterprise Security Invariant: Issue #1936
 * Title: feat(db): implement SQLite query validator prohibiting ATTACH DATABASE outside root
 */
export declare class SqliteAttachDatabaseSandboxEscape {
    private static readonly INVARIANT_NAME;
    static inspect(payload: string): {
        isThreat: boolean;
        invariant: string;
        latencyMs: number;
    };
    static validate(input: string): boolean;
}
//# sourceMappingURL=sqlite_attach_database_sandbox_escape.d.ts.map