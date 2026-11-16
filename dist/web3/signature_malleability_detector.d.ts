/**
 * Auto-generated Enterprise Security Invariant: Issue #1800
 * Title: feat(web3): implement strict ECDSA s-value normalization preventing signature malleability
 */
export declare class SignatureMalleabilityDetector {
    private static readonly INVARIANT_NAME;
    static inspect(payload: string): {
        isThreat: boolean;
        invariant: string;
        latencyMs: number;
    };
    static validate(input: string): boolean;
}
//# sourceMappingURL=signature_malleability_detector.d.ts.map