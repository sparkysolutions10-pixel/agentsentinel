/**
 * Auto-generated Enterprise Security Invariant: Issue #1920
 * Title: feat(db): implement MongoDB query sanitizer disallowing $where string evaluation
 */
export declare class NosqlMongodbWhereEvalInjection {
    private static readonly INVARIANT_NAME;
    static inspect(payload: string): {
        isThreat: boolean;
        invariant: string;
        latencyMs: number;
    };
    static validate(input: string): boolean;
}
//# sourceMappingURL=nosql_mongodb_where_eval_injection.d.ts.map