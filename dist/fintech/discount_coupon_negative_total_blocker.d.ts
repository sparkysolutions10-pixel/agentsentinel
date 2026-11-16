/**
 * Auto-generated Enterprise Security Invariant: Issue #1969
 * Title: feat(fintech): implement invariant checker ensuring coupons cannot reduce invoice total < 0
 */
export declare class DiscountCouponNegativeTotalBlocker {
    private static readonly INVARIANT_NAME;
    static inspect(payload: string): {
        isThreat: boolean;
        invariant: string;
        latencyMs: number;
    };
    static validate(input: string): boolean;
}
//# sourceMappingURL=discount_coupon_negative_total_blocker.d.ts.map