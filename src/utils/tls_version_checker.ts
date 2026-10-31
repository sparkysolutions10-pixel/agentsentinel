/**
 * AgentSentinel - TLS Version Checker Utility
 * Enforces enterprise TLS version compliance (TLS 1.2 or TLS 1.3).
 */

export type TlsVersion = 'SSLv2' | 'SSLv3' | 'TLSv1' | 'TLSv1.1' | 'TLSv1.2' | 'TLSv1.3';

export class TlsVersionChecker {
  private static readonly RANK: Record<string, number> = {
    SSLv2: 1,
    SSLv3: 2,
    TLSv1: 3,
    'TLSv1.0': 3,
    'TLSv1.1': 4,
    'TLSv1.2': 5,
    'TLSv1.3': 6
  };

  public static meetsMinimumVersion(
    version: string,
    minVersion: 'TLSv1.2' | 'TLSv1.3' = 'TLSv1.2'
  ): boolean {
    if (!version || typeof version !== 'string') return false;
    const cleanVer = version.trim();
    const currentRank = this.RANK[cleanVer] ?? 0;
    const requiredRank = this.RANK[minVersion];

    return currentRank >= requiredRank;
  }
}
