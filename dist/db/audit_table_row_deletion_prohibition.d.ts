/**
 * Auto-generated Enterprise Security Invariant: Issue #1929
 * Title: feat(db): implement append-only enforcement rule on audit and telemetry tables
 */
export declare class AuditTableRowDeletionProhibition {
    private static readonly INVARIANT_NAME;
    static inspect(payload: string): {
        isThreat: boolean;
        invariant: string;
        latencyMs: number;
    };
    static validate(input: string): boolean;
}
//# sourceMappingURL=audit_table_row_deletion_prohibition.d.ts.map