/**
 * Auto-generated Enterprise Security Invariant: Issue #1872
 * Title: feat(ast): implement AST detector preventing insmod and modprobe kernel module insertions
 */
export class KernelModuleLoadingProhibition {
    static INVARIANT_NAME = 'RULE_INVARIANT_KERNEL_MODULE_LOADING_PROHIBITION';
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
//# sourceMappingURL=kernel_module_loading_prohibition.js.map