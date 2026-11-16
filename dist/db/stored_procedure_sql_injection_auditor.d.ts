/**
 * Auto-generated Enterprise Security Invariant: Issue #1930
 * Title: feat(db): implement static analyzer reviewing PL/pgSQL stored procedure dynamic EXECUTE
 */
export declare class StoredProcedureSqlInjectionAuditor {
    private static readonly INVARIANT_NAME;
    static inspect(payload: string): {
        isThreat: boolean;
        invariant: string;
        latencyMs: number;
    };
    static validate(input: string): boolean;
}
//# sourceMappingURL=stored_procedure_sql_injection_auditor.d.ts.map