/**
 * Auto-generated Enterprise Security Invariant: Issue #1954
 * Title: feat(fintech): implement HMAC-SHA256 signature verifier for Razorpay webhook payloads
 */
export declare class RazorpayWebhookSignatureVerifier {
    private static readonly INVARIANT_NAME;
    static inspect(payload: string): {
        isThreat: boolean;
        invariant: string;
        latencyMs: number;
    };
    static validate(input: string): boolean;
}
//# sourceMappingURL=razorpay_webhook_signature_verifier.d.ts.map