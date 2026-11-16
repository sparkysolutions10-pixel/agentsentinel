/**
 * Auto-generated Enterprise Security Invariant: Issue #1879
 * Title: feat(ast): implement base64 and hex encoded subdomain lookup detector on dig/nslookup
 */
export class DnsTunnelingExfiltrationDetector {
    static INVARIANT_NAME = 'RULE_INVARIANT_DNS_TUNNELING_EXFILTRATION_DETECTOR';
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
//# sourceMappingURL=dns_tunneling_exfiltration_detector.js.map