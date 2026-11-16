/**
 * Auto-generated Enterprise Security Invariant: Issue #1911
 * Title: feat(db): implement confirmation lock before deleting Qdrant vector collections
 */
export declare class QdrantCollectionDropCircuitBreaker {
    private static readonly INVARIANT_NAME;
    static inspect(payload: string): {
        isThreat: boolean;
        invariant: string;
        latencyMs: number;
    };
    static validate(input: string): boolean;
}
//# sourceMappingURL=qdrant_collection_drop_circuit_breaker.d.ts.map