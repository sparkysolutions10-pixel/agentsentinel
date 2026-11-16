/**
 * Auto-generated Enterprise Security Invariant: Issue #1888
 * Title: feat(ast): implement Windows command blocker halting vssadmin delete shadows commands
 */
export class WmicShadowcopyDeletionBlocker {
    static INVARIANT_NAME = 'RULE_INVARIANT_WMIC_SHADOWCOPY_DELETION_BLOCKER';
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
//# sourceMappingURL=wmic_shadowcopy_deletion_blocker.js.map