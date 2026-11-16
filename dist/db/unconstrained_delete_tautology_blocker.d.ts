/**
 * Auto-generated Enterprise Security Invariant: Issue #1906
 * Title: feat(db): implement SQL AST detector halting DELETE FROM queries with WHERE 1=1
 */
export declare class UnconstrainedDeleteTautologyBlocker {
    private static readonly INVARIANT_NAME;
    static inspect(payload: string): {
        isThreat: boolean;
        invariant: string;
        latencyMs: number;
    };
    static validate(input: string): boolean;
}
//# sourceMappingURL=unconstrained_delete_tautology_blocker.d.ts.map