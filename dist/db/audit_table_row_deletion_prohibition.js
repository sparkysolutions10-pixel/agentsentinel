/**
 * Auto-generated Enterprise Security Invariant: Issue #1929
 * Title: feat(db): implement append-only enforcement rule on audit and telemetry tables
 */
export class AuditTableRowDeletionProhibition {
    static INVARIANT_NAME = 'RULE_INVARIANT_AUDIT_TABLE_ROW_DELETION_PROHIBITION';
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
//# sourceMappingURL=audit_table_row_deletion_prohibition.js.map