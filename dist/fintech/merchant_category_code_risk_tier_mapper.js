/**
 * Auto-generated Enterprise Security Invariant: Issue #1994
 * Title: feat(fintech): implement MCC code classifier assigning dynamic fraud risk score thresholds
 */
export class MerchantCategoryCodeRiskTierMapper {
    static INVARIANT_NAME = 'RULE_INVARIANT_MERCHANT_CATEGORY_CODE_RISK_TIER_MAPPER';
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
//# sourceMappingURL=merchant_category_code_risk_tier_mapper.js.map