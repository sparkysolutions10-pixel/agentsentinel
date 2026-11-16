/**
 * Auto-generated Enterprise Security Invariant: Issue #1919
 * Title: feat(db): implement automated regex and NER scrubber masking SSN and credit card numbers
 */
export declare class DocumentChunkPiiScrubber {
    private static readonly INVARIANT_NAME;
    static inspect(payload: string): {
        isThreat: boolean;
        invariant: string;
        latencyMs: number;
    };
    static validate(input: string): boolean;
}
//# sourceMappingURL=document_chunk_pii_scrubber.d.ts.map