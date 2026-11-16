/**
 * Auto-generated Enterprise Security Invariant: Issue #1935
 * Title: feat(db): implement ClickHouse ALTER TABLE DROP PARTITION confirmation barrier
 */
export declare class ClickhouseDropPartitionConfirmation {
    private static readonly INVARIANT_NAME;
    static inspect(payload: string): {
        isThreat: boolean;
        invariant: string;
        latencyMs: number;
    };
    static validate(input: string): boolean;
}
//# sourceMappingURL=clickhouse_drop_partition_confirmation.d.ts.map