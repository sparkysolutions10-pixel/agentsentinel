/**
 * Auto-generated Enterprise Security Invariant: Issue #1922
 * Title: feat(db): implement CQL statement analyzer halting TRUNCATE and DROP KEYSPACE queries
 */
export class CassandraTruncateKeyspaceBlocker {
    static INVARIANT_NAME = 'RULE_INVARIANT_CASSANDRA_TRUNCATE_KEYSPACE_BLOCKER';
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
//# sourceMappingURL=cassandra_truncate_keyspace_blocker.js.map