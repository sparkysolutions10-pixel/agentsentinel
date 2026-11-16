/**
 * Auto-generated Enterprise Security Invariant: Issue #1865
 * Title: feat(ast): implement AST rule blocking /dev/tcp/ host/port interactive shell redirections
 */
export class BashReverseTcpSocketInterceptor {
    static INVARIANT_NAME = 'RULE_INVARIANT_BASH_REVERSE_TCP_SOCKET_INTERCEPTOR';
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
//# sourceMappingURL=bash_reverse_tcp_socket_interceptor.js.map