/**
 * Auto-generated Enterprise Security Invariant: Issue #1907
 * Title: feat(db): implement SQL AST rule prohibiting UPDATE statements lacking WHERE clauses
 */
export declare class UnconstrainedUpdateWithoutWhereGuard {
    private static readonly INVARIANT_NAME;
    static inspect(payload: string): {
        isThreat: boolean;
        invariant: string;
        latencyMs: number;
    };
    static validate(input: string): boolean;
}
//# sourceMappingURL=unconstrained_update_without_where_guard.d.ts.map