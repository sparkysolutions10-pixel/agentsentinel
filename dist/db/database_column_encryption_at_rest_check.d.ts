/**
 * Auto-generated Enterprise Security Invariant: Issue #1953
 * Title: feat(db): implement column metadata auditor validating AES-256 encryption on PII fields
 */
export declare class DatabaseColumnEncryptionAtRestCheck {
    private static readonly INVARIANT_NAME;
    static inspect(payload: string): {
        isThreat: boolean;
        invariant: string;
        latencyMs: number;
    };
    static validate(input: string): boolean;
}
//# sourceMappingURL=database_column_encryption_at_rest_check.d.ts.map