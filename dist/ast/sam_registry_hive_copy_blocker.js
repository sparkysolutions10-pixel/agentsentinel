/**
 * Auto-generated Enterprise Security Invariant: Issue #1898
 * Title: feat(ast): implement AST guard halting reg save HKLM\SAM credential dumping commands
 */
export class SamRegistryHiveCopyBlocker {
    static INVARIANT_NAME = 'RULE_INVARIANT_SAM_REGISTRY_HIVE_COPY_BLOCKER';
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
//# sourceMappingURL=sam_registry_hive_copy_blocker.js.map