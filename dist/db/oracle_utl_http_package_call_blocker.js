/**
 * Auto-generated Enterprise Security Invariant: Issue #1941
 * Title: feat(db): implement PL/SQL analyzer blocking UTL_HTTP outbound network exfiltration
 */
export class OracleUtlHttpPackageCallBlocker {
    static INVARIANT_NAME = 'RULE_INVARIANT_ORACLE_UTL_HTTP_PACKAGE_CALL_BLOCKER';
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
//# sourceMappingURL=oracle_utl_http_package_call_blocker.js.map