/**
 * Auto-generated Enterprise Security Invariant: Issue #1950
 * Title: feat(db): implement dbt project validator ensuring incremental models declare unique keys
 */
export declare class DbtModelMaterializationGuard {
    private static readonly INVARIANT_NAME;
    static inspect(payload: string): {
        isThreat: boolean;
        invariant: string;
        latencyMs: number;
    };
    static validate(input: string): boolean;
}
//# sourceMappingURL=dbt_model_materialization_guard.d.ts.map