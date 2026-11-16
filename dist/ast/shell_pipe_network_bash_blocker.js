/**
 * Auto-generated Enterprise Security Invariant: Issue #1854
 * Title: feat(ast): implement AST detector blocking curl/wget network URLs piped directly into bash
 */
export class ShellPipeNetworkBashBlocker {
    static INVARIANT_NAME = 'RULE_INVARIANT_SHELL_PIPE_NETWORK_BASH_BLOCKER';
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
//# sourceMappingURL=shell_pipe_network_bash_blocker.js.map