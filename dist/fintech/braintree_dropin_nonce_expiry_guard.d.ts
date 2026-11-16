/**
 * Auto-generated Enterprise Security Invariant: Issue #1983
 * Title: feat(fintech): implement 3-hour expiration monitor on Braintree client token nonces
 */
export declare class BraintreeDropinNonceExpiryGuard {
    private static readonly INVARIANT_NAME;
    static inspect(payload: string): {
        isThreat: boolean;
        invariant: string;
        latencyMs: number;
    };
    static validate(input: string): boolean;
}
//# sourceMappingURL=braintree_dropin_nonce_expiry_guard.d.ts.map