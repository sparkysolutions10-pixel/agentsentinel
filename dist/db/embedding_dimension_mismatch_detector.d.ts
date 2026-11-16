/**
 * Auto-generated Enterprise Security Invariant: Issue #1916
 * Title: feat(db): implement vector dimension integrity validator preventing index crashes
 */
export declare class EmbeddingDimensionMismatchDetector {
    private static readonly INVARIANT_NAME;
    static inspect(payload: string): {
        isThreat: boolean;
        invariant: string;
        latencyMs: number;
    };
    static validate(input: string): boolean;
}
//# sourceMappingURL=embedding_dimension_mismatch_detector.d.ts.map