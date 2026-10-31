/**
 * AgentSentinel - IPv4 Subnet Matcher Utility
 * Evaluates whether an IPv4 address falls within a designated CIDR network block.
 */

export class Ipv4SubnetMatcher {
  public static ipToInt(ip: string): number {
    const parts = ip.trim().split('.');
    if (parts.length !== 4) return 0;
    return (
      ((parseInt(parts[0], 10) << 24) |
        (parseInt(parts[1], 10) << 16) |
        (parseInt(parts[2], 10) << 8) |
        parseInt(parts[3], 10)) >>>
      0
    );
  }

  public static isInSubnet(ip: string, cidr: string): boolean {
    if (!ip || !cidr) return false;
    const [rangeIp, prefixStr] = cidr.trim().split('/');
    const prefix = prefixStr !== undefined ? parseInt(prefixStr, 10) : 32;

    if (isNaN(prefix) || prefix < 0 || prefix > 32) return false;

    const ipInt = this.ipToInt(ip);
    const rangeInt = this.ipToInt(rangeIp);

    if (prefix === 0) return true;
    const mask = (0xffffffff << (32 - prefix)) >>> 0;

    return (ipInt & mask) === (rangeInt & mask);
  }
}
