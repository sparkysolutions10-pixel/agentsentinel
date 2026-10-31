/**
 * AgentSentinel - Private IP Detector Utility
 * Identifies RFC-1918, loopback, and link-local IP addresses for SSRF prevention.
 */

import { Ipv4SubnetMatcher } from './ipv4_subnet_matcher.js';
import { Ipv6Canonicalizer } from './ipv6_canonicalizer.js';

export class PrivateIpDetector {
  private static readonly PRIVATE_IPV4_SUBNETS = [
    '10.0.0.0/8',
    '172.16.0.0/12',
    '192.168.0.0/16',
    '127.0.0.0/8',
    '169.254.0.0/16',
    '0.0.0.0/8'
  ];

  public static isPrivateOrLocal(ip: string): boolean {
    if (!ip || typeof ip !== 'string') return false;
    const clean = ip.trim().toLowerCase();

    // Check localhost string aliases
    if (clean === 'localhost' || clean === '127.0.0.1') return true;

    // Check IPv6
    if (clean.includes(':')) {
      if (Ipv6Canonicalizer.isLoopback(clean)) return true;
      if (clean.startsWith('fe80:') || clean.startsWith('fc00:') || clean.startsWith('fd00:')) {
        return true;
      }
      return false;
    }

    // Check IPv4 subnets
    for (const subnet of this.PRIVATE_IPV4_SUBNETS) {
      if (Ipv4SubnetMatcher.isInSubnet(clean, subnet)) {
        return true;
      }
    }

    return false;
  }
}
