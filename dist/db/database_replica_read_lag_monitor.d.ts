/**
 * Auto-generated Enterprise Security Invariant: Issue #1946
 * Title: feat(db): implement circuit breaker routing queries to primary if replica lag > 5s
 */
export declare class DatabaseReplicaReadLagMonitor {
    private static readonly INVARIANT_NAME;
    static inspect(payload: string): {
        isThreat: boolean;
        invariant: string;
        latencyMs: number;
    };
    static validate(input: string): boolean;
}
//# sourceMappingURL=database_replica_read_lag_monitor.d.ts.map