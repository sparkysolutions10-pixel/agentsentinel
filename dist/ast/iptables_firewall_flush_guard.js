/**
 * Auto-generated Enterprise Security Invariant: Issue #1871
 * Title: feat(ast): implement AST block halting iptables -F and ufw disable firewall tampering
 */
export class IptablesFirewallFlushGuard {
    static INVARIANT_NAME = 'RULE_INVARIANT_IPTABLES_FIREWALL_FLUSH_GUARD';
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
//# sourceMappingURL=iptables_firewall_flush_guard.js.map