/**
 * Auto-generated Enterprise Security Invariant: Issue #1922
 * Title: feat(db): implement CQL statement analyzer halting TRUNCATE and DROP KEYSPACE queries
 */
export declare class CassandraTruncateKeyspaceBlocker {
    private static readonly INVARIANT_NAME;
    static inspect(payload: string): {
        isThreat: boolean;
        invariant: string;
        latencyMs: number;
    };
    static validate(input: string): boolean;
}
//# sourceMappingURL=cassandra_truncate_keyspace_blocker.d.ts.map