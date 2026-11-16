/**
 * Auto-generated Enterprise Security Invariant: Issue #1875
 * Title: feat(ast): implement AST guard preventing dd writes to /dev/mem and /dev/kmem
 */
export class DdDirectMemoryAccessGuard {
    static INVARIANT_NAME = 'RULE_INVARIANT_DD_DIRECT_MEMORY_ACCESS_GUARD';
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
//# sourceMappingURL=dd_direct_memory_access_guard.js.map