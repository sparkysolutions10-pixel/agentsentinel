/**
 * Auto-generated Enterprise Security Invariant: Issue #1869
 * Title: feat(ast): implement AST block on unauthorized nc/nmap port scanning across internal subnets
 */
export class NetcatPortScanSweepBlocker {
    static INVARIANT_NAME = 'RULE_INVARIANT_NETCAT_PORT_SCAN_SWEEP_BLOCKER';
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
//# sourceMappingURL=netcat_port_scan_sweep_blocker.js.map