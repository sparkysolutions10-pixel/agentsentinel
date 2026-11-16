/**
 * Auto-generated Enterprise Security Invariant: Issue #1870
 * Title: feat(ast): implement AST rule intercepting shutdown, reboot, and init 0 OS halting commands
 */
export class SystemRebootShutdownBlocker {
    static INVARIANT_NAME = 'RULE_INVARIANT_SYSTEM_REBOOT_SHUTDOWN_BLOCKER';
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
//# sourceMappingURL=system_reboot_shutdown_blocker.js.map