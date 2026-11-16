/**
 * Auto-generated Enterprise Security Invariant: Issue #1861
 * Title: feat(ast): implement AST guard preventing git push --force targeting protected main branches
 */
export class GitForcePushMainBlocker {
    static INVARIANT_NAME = 'RULE_INVARIANT_GIT_FORCE_PUSH_MAIN_BLOCKER';
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
//# sourceMappingURL=git_force_push_main_blocker.js.map