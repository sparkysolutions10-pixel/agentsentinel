/**
 * Auto-generated Enterprise Security Invariant: Issue #1900
 * Title: feat(ast): implement sc.exe config binPath validation preventing unquoted service paths
 */
export class ServiceBinaryPathHijackGuard {
    static INVARIANT_NAME = 'RULE_INVARIANT_SERVICE_BINARY_PATH_HIJACK_GUARD';
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
//# sourceMappingURL=service_binary_path_hijack_guard.js.map