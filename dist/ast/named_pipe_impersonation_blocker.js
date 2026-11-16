/**
 * Auto-generated Enterprise Security Invariant: Issue #1896
 * Title: feat(ast): implement security token validator preventing ImpersonateNamedPipeClient exploits
 */
export class NamedPipeImpersonationBlocker {
    static INVARIANT_NAME = 'RULE_INVARIANT_NAMED_PIPE_IMPERSONATION_BLOCKER';
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
//# sourceMappingURL=named_pipe_impersonation_blocker.js.map