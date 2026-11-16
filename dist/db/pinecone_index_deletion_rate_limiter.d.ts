/**
 * Auto-generated Enterprise Security Invariant: Issue #1912
 * Title: feat(db): implement API rate limit and confirmation token on Pinecone deleteIndex calls
 */
export declare class PineconeIndexDeletionRateLimiter {
    private static readonly INVARIANT_NAME;
    static inspect(payload: string): {
        isThreat: boolean;
        invariant: string;
        latencyMs: number;
    };
    static validate(input: string): boolean;
}
//# sourceMappingURL=pinecone_index_deletion_rate_limiter.d.ts.map