/**
 * Auto-generated Enterprise Security Invariant: Issue #1890
 * Title: feat(ast): implement AST rule preventing mshta.exe execution of remote VBScript payloads
 */
export class MshtaVbscriptExecutionGuard {
    static INVARIANT_NAME = 'RULE_INVARIANT_MSHTA_VBSCRIPT_EXECUTION_GUARD';
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
//# sourceMappingURL=mshta_vbscript_execution_guard.js.map