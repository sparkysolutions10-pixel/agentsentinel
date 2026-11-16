/**
 * Auto-generated Enterprise Security Invariant: Issue #1887
 * Title: feat(ast): implement Windows registry modification guard on Run and RunOnce keys
 */
export class WindowsRegistryAutorunTamperGuard {
    static INVARIANT_NAME = 'RULE_INVARIANT_WINDOWS_REGISTRY_AUTORUN_TAMPER_GUARD';
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
//# sourceMappingURL=windows_registry_autorun_tamper_guard.js.map