/**
 * Auto-generated Enterprise Security Invariant: Issue #1917
 * Title: feat(db): implement vector normalization validator preventing NaN/Inf similarity scores
 */
export declare class CosineSimilarityNanValueSanitizer {
    private static readonly INVARIANT_NAME;
    static inspect(payload: string): {
        isThreat: boolean;
        invariant: string;
        latencyMs: number;
    };
    static validate(input: string): boolean;
}
//# sourceMappingURL=cosine_similarity_nan_value_sanitizer.d.ts.map