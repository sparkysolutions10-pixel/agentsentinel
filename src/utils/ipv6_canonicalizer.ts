/**
 * AgentSentinel - IPv6 Canonicalizer Utility
 * Expands and normalizes IPv6 addresses to standard 8-group hexadecimal notation.
 */

export class Ipv6Canonicalizer {
  public static isValid(ip: string): boolean {
    if (!ip || typeof ip !== 'string') return false;
    const clean = ip.trim();
    if (!clean.includes(':')) return false;
    return /^([0-9a-fA-F]{0,4}:){2,7}[0-9a-fA-F]{0,4}$/.test(clean) || clean === '::';
  }

  public static expand(ip: string): string {
    if (!this.isValid(ip)) {
      throw new Error(`Invalid IPv6 address: "${ip}"`);
    }

    const clean = ip.trim().toLowerCase();
    const parts = clean.split('::');

    if (parts.length > 2) {
      throw new Error(`Invalid IPv6 (multiple ::): "${ip}"`);
    }

    let left = parts[0] ? parts[0].split(':') : [];
    let right = parts.length === 2 && parts[1] ? parts[1].split(':') : [];

    const missingCount = 8 - (left.length + right.length);
    const middle: string[] = [];
    for (let i = 0; i < missingCount; i++) {
      middle.push('0');
    }

    const full = [...left, ...middle, ...right].map(seg => seg.padStart(4, '0'));
    return full.join(':');
  }

  public static isLoopback(ip: string): boolean {
    try {
      const expanded = this.expand(ip);
      return expanded === '0000:0000:0000:0000:0000:0000:0000:0001';
    } catch {
      return false;
    }
  }
}
