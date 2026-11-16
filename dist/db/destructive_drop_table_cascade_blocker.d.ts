/**
 * Auto-generated Enterprise Security Invariant: Issue #1904
 * Title: feat(db): implement AST SQL parser halting unconstrained DROP TABLE CASCADE statements
 */
export declare class DestructiveDropTableCascadeBlocker {
    private static readonly INVARIANT_NAME;
    static inspect(payload: string): {
        isThreat: boolean;
        invariant: string;
        latencyMs: number;
    };
    static validate(input: string): boolean;
}
//# sourceMappingURL=destructive_drop_table_cascade_blocker.d.ts.map