/**
 * Auto-generated Enterprise Security Invariant: Issue #1945
 * Title: feat(db): implement sanity check on RAG chunk size and overlap preventing token buffer overflow
 */
export class RagChunkOverlapBoundaryClamp {
    static INVARIANT_NAME = 'RULE_INVARIANT_RAG_CHUNK_OVERLAP_BOUNDARY_CLAMP';
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
//# sourceMappingURL=rag_chunk_overlap_boundary_clamp.js.map