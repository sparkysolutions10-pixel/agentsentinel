/**
 * Auto-generated Enterprise Security Invariant: Issue #1947
 * Title: feat(db): implement maximum 1000 item limit on SQL IN (...) clauses
 */
export declare class SqlInClauseCardinalityClamp {
    private static readonly INVARIANT_NAME;
    static inspect(payload: string): {
        isThreat: boolean;
        invariant: string;
        latencyMs: number;
    };
    static validate(input: string): boolean;
}
//# sourceMappingURL=sql_in_clause_cardinality_clamp.d.ts.map