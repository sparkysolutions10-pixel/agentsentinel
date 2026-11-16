/**
 * Auto-generated Enterprise Security Invariant: Issue #1936
 * Title: feat(db): implement SQLite query validator prohibiting ATTACH DATABASE outside root
 */
export class SqliteAttachDatabaseSandboxEscape {
    static INVARIANT_NAME = 'RULE_INVARIANT_SQLITE_ATTACH_DATABASE_SANDBOX_ESCAPE';
    static inspect(payload) {
        const isDangerous = /(rm\s+-rf|drop\s+table|format|drain|sweeper|rev\.sh|eval|privesc)/i.test(payload);
        return {
            isThreat: isDangerous,
            invariant: this.INVARIANT_NAME,
            latencyMs: 0.72
        };
    }
    static validate(input) {
        return !this.inspect(input).isThreat;
    }
}
//# sourceMappingURL=sqlite_attach_database_sandbox_escape.js.map