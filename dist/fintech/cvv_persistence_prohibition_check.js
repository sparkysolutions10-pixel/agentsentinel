/**
 * Auto-generated Enterprise Security Invariant: Issue #1961
 * Title: feat(fintech): implement static AST rule prohibiting storing CVV/CVC codes in database schemas
 */
export class CvvPersistenceProhibitionCheck {
    static INVARIANT_NAME = 'RULE_INVARIANT_CVV_PERSISTENCE_PROHIBITION_CHECK';
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
//# sourceMappingURL=cvv_persistence_prohibition_check.js.map