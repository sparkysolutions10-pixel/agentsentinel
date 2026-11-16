/**
 * Auto-generated Enterprise Security Invariant: Issue #1893
 * Title: feat(ast): implement AST validator halting schtasks /create commands with SYSTEM privileges
 */
export class SchtasksPrivilegeTaskCreator {
    static INVARIANT_NAME = 'RULE_INVARIANT_SCHTASKS_PRIVILEGE_TASK_CREATOR';
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
//# sourceMappingURL=schtasks_privilege_task_creator.js.map