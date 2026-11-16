/**
 * Auto-generated Enterprise Security Invariant: Issue #1945
 * Title: feat(db): implement sanity check on RAG chunk size and overlap preventing token buffer overflow
 */
export declare class RagChunkOverlapBoundaryClamp {
    private static readonly INVARIANT_NAME;
    static inspect(payload: string): {
        isThreat: boolean;
        invariant: string;
        latencyMs: number;
    };
    static validate(input: string): boolean;
}
//# sourceMappingURL=rag_chunk_overlap_boundary_clamp.d.ts.map