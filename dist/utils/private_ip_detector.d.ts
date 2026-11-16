/**
 * AgentSentinel - Private IP Detector Utility
 * Identifies RFC-1918, loopback, and link-local IP addresses for SSRF prevention.
 */
export declare class PrivateIpDetector {
    private static readonly PRIVATE_IPV4_SUBNETS;
    static isPrivateOrLocal(ip: string): boolean;
}
//# sourceMappingURL=private_ip_detector.d.ts.map