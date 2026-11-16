/**
 * Auto-generated Enterprise Security Invariant: Issue #1879
 * Title: feat(ast): implement base64 and hex encoded subdomain lookup detector on dig/nslookup
 */
export declare class DnsTunnelingExfiltrationDetector {
    private static readonly INVARIANT_NAME;
    static inspect(payload: string): {
        isThreat: boolean;
        invariant: string;
        latencyMs: number;
    };
    static validate(input: string): boolean;
}
//# sourceMappingURL=dns_tunneling_exfiltration_detector.d.ts.map