/**
 * Auto-generated Enterprise Security Invariant: Issue #1927
 * Title: feat(db): implement SQL prepared statement parameter bounds checker (< 65535)
 */
export declare class PreparedStatementParameterCountGuard {
    private static readonly INVARIANT_NAME;
    static inspect(payload: string): {
        isThreat: boolean;
        invariant: string;
        latencyMs: number;
    };
    static validate(input: string): boolean;
}
//# sourceMappingURL=prepared_statement_parameter_count_guard.d.ts.map