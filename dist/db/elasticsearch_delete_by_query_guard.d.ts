/**
 * Auto-generated Enterprise Security Invariant: Issue #1923
 * Title: feat(db): implement Elasticsearch query validator halting match_all delete operations
 */
export declare class ElasticsearchDeleteByQueryGuard {
    private static readonly INVARIANT_NAME;
    static inspect(payload: string): {
        isThreat: boolean;
        invariant: string;
        latencyMs: number;
    };
    static validate(input: string): boolean;
}
//# sourceMappingURL=elasticsearch_delete_by_query_guard.d.ts.map