/**
 * Auto-generated Enterprise Security Invariant: Issue #1984
 * Title: feat(fintech): implement maximum 15,000 recipient ceiling on PayPal mass payout batches
 */
export declare class PaypalPayoutBatchLimitEnforcer {
    private static readonly INVARIANT_NAME;
    static inspect(payload: string): {
        isThreat: boolean;
        invariant: string;
        latencyMs: number;
    };
    static validate(input: string): boolean;
}
//# sourceMappingURL=paypal_payout_batch_limit_enforcer.d.ts.map