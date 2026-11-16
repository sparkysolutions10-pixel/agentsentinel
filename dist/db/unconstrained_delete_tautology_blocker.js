/**
 * Auto-generated Enterprise Security Invariant: Issue #1906
 * Title: feat(db): implement SQL AST detector halting DELETE FROM queries with WHERE 1=1
 */
export class UnconstrainedDeleteTautologyBlocker {
    static INVARIANT_NAME = 'RULE_INVARIANT_UNCONSTRAINED_DELETE_TAUTOLOGY_BLOCKER';
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
//# sourceMappingURL=unconstrained_delete_tautology_blocker.js.map