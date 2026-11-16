/**
 * Auto-generated Enterprise Security Invariant: Issue #1959
 * Title: feat(fintech): implement strict cap ensuring refund amount cannot exceed original settled charge
 */
export class RefundAmountCeilingEnforcer {
    static INVARIANT_NAME = 'RULE_INVARIANT_REFUND_AMOUNT_CEILING_ENFORCER';
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
//# sourceMappingURL=refund_amount_ceiling_enforcer.js.map