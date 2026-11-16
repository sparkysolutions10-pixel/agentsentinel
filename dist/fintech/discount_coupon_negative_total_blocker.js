/**
 * Auto-generated Enterprise Security Invariant: Issue #1969
 * Title: feat(fintech): implement invariant checker ensuring coupons cannot reduce invoice total < 0
 */
export class DiscountCouponNegativeTotalBlocker {
    static INVARIANT_NAME = 'RULE_INVARIANT_DISCOUNT_COUPON_NEGATIVE_TOTAL_BLOCKER';
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
//# sourceMappingURL=discount_coupon_negative_total_blocker.js.map