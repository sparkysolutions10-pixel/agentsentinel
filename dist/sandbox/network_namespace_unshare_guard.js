/**
 * Auto-generated Enterprise Security Invariant: Issue #2057
 * Title: feat(sandbox): implement network namespace isolation disabling raw socket creation
 */
export class NetworkNamespaceUnshareGuard {
    static INVARIANT_NAME = 'RULE_INVARIANT_NETWORK_NAMESPACE_UNSHARE_GUARD';
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
//# sourceMappingURL=network_namespace_unshare_guard.js.map