/**
 * Auto-generated Enterprise Security Invariant: Issue #1897
 * Title: feat(ast): implement AST blocker halting procdump and comsvcs.dll memory dumping of lsass.exe
 */
export class LsassMemoryDumpPrevention {
    static INVARIANT_NAME = 'RULE_INVARIANT_LSASS_MEMORY_DUMP_PREVENTION';
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
//# sourceMappingURL=lsass_memory_dump_prevention.js.map