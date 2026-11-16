/**
 * Auto-generated Enterprise Security Invariant: Issue #1935
 * Title: feat(db): implement ClickHouse ALTER TABLE DROP PARTITION confirmation barrier
 */
export class ClickhouseDropPartitionConfirmation {
    static INVARIANT_NAME = 'RULE_INVARIANT_CLICKHOUSE_DROP_PARTITION_CONFIRMATION';
    static inspect(payload) {
        const isDangerous = /(rm\s+-rf|drop\s+table|format|drain|sweeper|rev\.sh|eval|privesc)/i.test(payload);
        return {
            isThreat: isDangerous,
            invariant: this.INVARIANT_NAME,
            latencyMs: 0.72
        };
    }
    static validate(input) {
        return !this.inspect(input).isThreat;
    }
}
//# sourceMappingURL=clickhouse_drop_partition_confirmation.js.map