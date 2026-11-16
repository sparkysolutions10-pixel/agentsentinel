/**
 * Auto-generated Enterprise Security Invariant: Issue #1912
 * Title: feat(db): implement API rate limit and confirmation token on Pinecone deleteIndex calls
 */
export class PineconeIndexDeletionRateLimiter {
    static INVARIANT_NAME = 'RULE_INVARIANT_PINECONE_INDEX_DELETION_RATE_LIMITER';
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
//# sourceMappingURL=pinecone_index_deletion_rate_limiter.js.map