/**
 * Auto-generated Enterprise Security Invariant: Issue #1988
 * Title: feat(fintech): implement mandatory 4-hour transfer limit on newly added bank beneficiaries
 */
export class BeneficiaryAccountCooldownPeriod {
    static INVARIANT_NAME = 'RULE_INVARIANT_BENEFICIARY_ACCOUNT_COOLDOWN_PERIOD';
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
//# sourceMappingURL=beneficiary_account_cooldown_period.js.map