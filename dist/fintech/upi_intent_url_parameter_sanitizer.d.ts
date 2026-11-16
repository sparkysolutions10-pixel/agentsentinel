/**
 * Auto-generated Enterprise Security Invariant: Issue #1956
 * Title: feat(fintech): implement UPI deep-link validator verifying VPA and exact transaction amount
 */
export declare class UpiIntentUrlParameterSanitizer {
    private static readonly INVARIANT_NAME;
    static inspect(payload: string): {
        isThreat: boolean;
        invariant: string;
        latencyMs: number;
    };
    static validate(input: string): boolean;
}
//# sourceMappingURL=upi_intent_url_parameter_sanitizer.d.ts.map