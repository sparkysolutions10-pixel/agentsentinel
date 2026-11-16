/**
 * Auto-generated Enterprise Security Invariant: Issue #1909
 * Title: feat(db): implement AST analyzer detecting UNION SELECT schema discovery injection probes
 */
export declare class UnionBasedSqlInjectionDetector {
    private static readonly INVARIANT_NAME;
    static inspect(payload: string): {
        isThreat: boolean;
        invariant: string;
        latencyMs: number;
    };
    static validate(input: string): boolean;
}
//# sourceMappingURL=union_based_sql_injection_detector.d.ts.map