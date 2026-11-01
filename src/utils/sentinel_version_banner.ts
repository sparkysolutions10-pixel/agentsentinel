export class SentinelVersionBanner {
  public static getBanner(version: string = '0.1.0'): string {
    return [
      '==============================================================',
      `🛡️  AgentSentinel Pro [Enterprise AI Agent Security] v${version}`,
      '⚡  Zero-Trust Firewall & Autonomous Soroban Web3 Interceptor',
      '=============================================================='
    ].join('\n');
  }
}
