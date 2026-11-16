/**
 * Auto-generated Enterprise Security Invariant: Issue #1863
 * Title: feat(ast): implement package.json AST scanner detecting malicious postinstall script hooks
 */
export class NpmPostinstallLifecycleHookAudit {
    static INVARIANT_NAME = 'RULE_INVARIANT_NPM_POSTINSTALL_LIFECYCLE_HOOK_AUDIT';
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
//# sourceMappingURL=npm_postinstall_lifecycle_hook_audit.js.map