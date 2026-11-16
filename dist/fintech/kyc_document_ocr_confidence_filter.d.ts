/**
 * Auto-generated Enterprise Security Invariant: Issue #1987
 * Title: feat(fintech): implement 85% minimum OCR confidence threshold on government passport scans
 */
export declare class KycDocumentOcrConfidenceFilter {
    private static readonly INVARIANT_NAME;
    static inspect(payload: string): {
        isThreat: boolean;
        invariant: string;
        latencyMs: number;
    };
    static validate(input: string): boolean;
}
//# sourceMappingURL=kyc_document_ocr_confidence_filter.d.ts.map