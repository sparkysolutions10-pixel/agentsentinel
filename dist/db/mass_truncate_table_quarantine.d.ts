/**
 * Auto-generated Enterprise Security Invariant: Issue #1905
 * Title: feat(db): implement database DDL guard quarantining TRUNCATE TABLE production commands
 */
export declare class MassTruncateTableQuarantine {
    private static readonly INVARIANT_NAME;
    static inspect(payload: string): {
        isThreat: boolean;
        invariant: string;
        latencyMs: number;
    };
    static validate(input: string): boolean;
}
//# sourceMappingURL=mass_truncate_table_quarantine.d.ts.map