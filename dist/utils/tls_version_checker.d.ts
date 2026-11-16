/**
 * AgentSentinel - TLS Version Checker Utility
 * Enforces enterprise TLS version compliance (TLS 1.2 or TLS 1.3).
 */
export type TlsVersion = 'SSLv2' | 'SSLv3' | 'TLSv1' | 'TLSv1.1' | 'TLSv1.2' | 'TLSv1.3';
export declare class TlsVersionChecker {
    private static readonly RANK;
    static meetsMinimumVersion(version: string, minVersion?: 'TLSv1.2' | 'TLSv1.3'): boolean;
}
//# sourceMappingURL=tls_version_checker.d.ts.map