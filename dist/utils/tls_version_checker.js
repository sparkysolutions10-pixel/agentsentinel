/**
 * AgentSentinel - TLS Version Checker Utility
 * Enforces enterprise TLS version compliance (TLS 1.2 or TLS 1.3).
 */
export class TlsVersionChecker {
    static RANK = {
        SSLv2: 1,
        SSLv3: 2,
        TLSv1: 3,
        'TLSv1.0': 3,
        'TLSv1.1': 4,
        'TLSv1.2': 5,
        'TLSv1.3': 6
    };
    static meetsMinimumVersion(version, minVersion = 'TLSv1.2') {
        if (!version || typeof version !== 'string')
            return false;
        const cleanVer = version.trim();
        const currentRank = this.RANK[cleanVer] ?? 0;
        const requiredRank = this.RANK[minVersion];
        return currentRank >= requiredRank;
    }
}
//# sourceMappingURL=tls_version_checker.js.map