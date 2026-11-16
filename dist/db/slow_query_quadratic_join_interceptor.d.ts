/**
 * Auto-generated Enterprise Security Invariant: Issue #1925
 * Title: feat(db): implement SQL query complexity analyzer flagging unindexed cross-joins
 */
export declare class SlowQueryQuadraticJoinInterceptor {
    private static readonly INVARIANT_NAME;
    static inspect(payload: string): {
        isThreat: boolean;
        invariant: string;
        latencyMs: number;
    };
    static validate(input: string): boolean;
}
//# sourceMappingURL=slow_query_quadratic_join_interceptor.d.ts.map