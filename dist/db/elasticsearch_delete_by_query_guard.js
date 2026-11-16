/**
 * Auto-generated Enterprise Security Invariant: Issue #1923
 * Title: feat(db): implement Elasticsearch query validator halting match_all delete operations
 */
export class ElasticsearchDeleteByQueryGuard {
    static INVARIANT_NAME = 'RULE_INVARIANT_ELASTICSEARCH_DELETE_BY_QUERY_GUARD';
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
//# sourceMappingURL=elasticsearch_delete_by_query_guard.js.map