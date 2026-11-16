/**
 * Auto-generated Enterprise Security Invariant: Issue #1924
 * Title: feat(db): implement connection pool limiter preventing query flood denial of service
 */
export declare class DatabaseConnectionPoolExhaustionClamp {
    private static readonly INVARIANT_NAME;
    static inspect(payload: string): {
        isThreat: boolean;
        invariant: string;
        latencyMs: number;
    };
    static validate(input: string): boolean;
}
//# sourceMappingURL=database_connection_pool_exhaustion_clamp.d.ts.map