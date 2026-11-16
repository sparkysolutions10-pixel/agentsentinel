/**
 * Auto-generated Enterprise Security Invariant: Issue #1942
 * Title: feat(db): implement N1QL query parameterization enforcer for Couchbase applications
 */
export declare class CouchbaseN1qlInjectionSanitizer {
    private static readonly INVARIANT_NAME;
    static inspect(payload: string): {
        isThreat: boolean;
        invariant: string;
        latencyMs: number;
    };
    static validate(input: string): boolean;
}
//# sourceMappingURL=couchbase_n1ql_injection_sanitizer.d.ts.map