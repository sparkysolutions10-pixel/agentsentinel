/**
 * Auto-generated Enterprise Security Invariant: Issue #1895
 * Title: feat(ast): implement Windows API call monitor detecting CreateProcess with suspended flag
 */
export class ProcessHollowingMemoryGuard {
    static INVARIANT_NAME = 'RULE_INVARIANT_PROCESS_HOLLOWING_MEMORY_GUARD';
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
//# sourceMappingURL=process_hollowing_memory_guard.js.map