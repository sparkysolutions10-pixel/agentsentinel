/**
 * Auto-generated Enterprise Security Invariant: Issue #1934
 * Title: feat(db): implement BigQuery query validator requiring partition filter on scans > 1TB
 */
export declare class BigqueryUnpartitionedQueryBlocker {
    private static readonly INVARIANT_NAME;
    static inspect(payload: string): {
        isThreat: boolean;
        invariant: string;
        latencyMs: number;
    };
    static validate(input: string): boolean;
}
//# sourceMappingURL=bigquery_unpartitioned_query_blocker.d.ts.map