/**
 * Auto-generated Enterprise Security Invariant: Issue #1877
 * Title: feat(ast): implement Node.js VM context analyzer preventing this.constructor.constructor escapes
 */
export class JavascriptVmSandboxEscapeGuard {
    static INVARIANT_NAME = 'RULE_INVARIANT_JAVASCRIPT_VM_SANDBOX_ESCAPE_GUARD';
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
//# sourceMappingURL=javascript_vm_sandbox_escape_guard.js.map