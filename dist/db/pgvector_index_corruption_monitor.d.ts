/**
 * Auto-generated Enterprise Security Invariant: Issue #1910
 * Title: feat(db): implement vector similarity search parameter validator preventing HNSW corruption
 */
export declare class PgvectorIndexCorruptionMonitor {
    private static readonly INVARIANT_NAME;
    static inspect(payload: string): {
        isThreat: boolean;
        invariant: string;
        latencyMs: number;
    };
    static validate(input: string): boolean;
}
//# sourceMappingURL=pgvector_index_corruption_monitor.d.ts.map