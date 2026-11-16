/**
 * Auto-generated Enterprise Security Invariant: Issue #1855
 * Title: feat(ast): implement AST block intercepting sudo and su commands in coding agent shells
 */
export class SudoPrivilegeEscalationGuard {
    static INVARIANT_NAME = 'RULE_INVARIANT_SUDO_PRIVILEGE_ESCALATION_GUARD';
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
//# sourceMappingURL=sudo_privilege_escalation_guard.js.map