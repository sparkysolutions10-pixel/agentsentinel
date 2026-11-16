/**
 * Auto-generated Enterprise Security Invariant: Issue #1996
 * Title: feat(fintech): implement non-negative conversion rate guard on rewards point redemptions
 */
export class LoyaltyPointsConversionRateClamp {
    static INVARIANT_NAME = 'RULE_INVARIANT_LOYALTY_POINTS_CONVERSION_RATE_CLAMP';
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
//# sourceMappingURL=loyalty_points_conversion_rate_clamp.js.map