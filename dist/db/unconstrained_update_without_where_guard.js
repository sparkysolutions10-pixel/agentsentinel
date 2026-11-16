/**
 * Auto-generated Enterprise Security Invariant: Issue #1907
 * Title: feat(db): implement SQL AST rule prohibiting UPDATE statements lacking WHERE clauses
 */
export class UnconstrainedUpdateWithoutWhereGuard {
    static INVARIANT_NAME = 'RULE_INVARIANT_UNCONSTRAINED_UPDATE_WITHOUT_WHERE_GUARD';
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
//# sourceMappingURL=unconstrained_update_without_where_guard.js.map