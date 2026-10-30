/**
 * AgentSentinel Outbound Network Destination IP & Domain Allowlist Rule.
 * Prevents unauthorized data exfiltration, SSRF attacks, and rogue webhooks
 * by verifying outbound URLs and hostnames against a strict enterprise allowlist.
 */

import { SentinelRule, ToolCallContext, RuleViolation, Verdict } from '../types.js';

export interface NetworkAllowlistOptions {
  allowedDomains?: string[];
  allowedIps?: string[];
  allowLocalhost?: boolean;
  urlParamKeys?: string[];
  action?: 'BLOCK' | 'CONFIRM';
}

export interface NetworkDestinationValidation {
  allowed: boolean;
  destination?: string;
  reason?: string;
  isExfiltrationRisk?: boolean;
}

const DEFAULT_URL_PARAM_KEYS = [
  'url',
  'endpoint',
  'uri',
  'target',
  'dest',
  'destination',
  'host',
  'hostname',
  'webhook',
];

export class NetworkAllowlistGuard {
  private allowedDomains: string[];
  private allowedIps: Set<string>;
  private allowLocalhost: boolean;
  private urlParamKeys: string[];
  private action: 'BLOCK' | 'CONFIRM';

  constructor(options: NetworkAllowlistOptions = {}) {
    this.allowedDomains = (options.allowedDomains ?? []).map((d) => d.toLowerCase().trim());
    this.allowedIps = new Set((options.allowedIps ?? []).map((ip) => ip.trim()));
    this.allowLocalhost = options.allowLocalhost ?? false;
    this.urlParamKeys = options.urlParamKeys ?? DEFAULT_URL_PARAM_KEYS;
    this.action = options.action ?? 'BLOCK';
  }

  /**
   * Matches a hostname against an allowlist pattern, supporting leading wildcard (*.domain.com).
   */
  public matchesPattern(hostname: string, pattern: string): boolean {
    const host = hostname.toLowerCase();
    const pat = pattern.toLowerCase();

    if (host === pat) return true;

    if (pat.startsWith('*.')) {
      const rootDomain = pat.slice(2);
      return host === rootDomain || host.endsWith('.' + rootDomain);
    }

    if (pat.startsWith('.')) {
      const rootDomain = pat.slice(1);
      return host === rootDomain || host.endsWith('.' + rootDomain);
    }

    return false;
  }

  /**
   * Extracts target URLs or hostnames from deeply nested tool parameters.
   */
  public extractDestinations(params: Record<string, any>): string[] {
    const destinations: string[] = [];

    const traverse = (obj: unknown, keyName?: string): void => {
      if (typeof obj === 'string') {
        const trimmed = obj.trim();
        const isUrl = /^https?:\/\//i.test(trimmed) || /^(?:ftp|ws|wss):\/\//i.test(trimmed);
        const isKeyMatch = keyName && this.urlParamKeys.includes(keyName.toLowerCase());

        if (isUrl || isKeyMatch) {
          destinations.push(trimmed);
        }
      } else if (Array.isArray(obj)) {
        obj.forEach((item) => traverse(item));
      } else if (obj !== null && typeof obj === 'object') {
        for (const [k, v] of Object.entries(obj)) {
          traverse(v, k);
        }
      }
    };

    traverse(params);
    return destinations;
  }

  /**
   * Validates a destination string (URL or hostname) against configured network policies.
   */
  public validateDestination(raw: string): NetworkDestinationValidation {
    if (!raw || typeof raw !== 'string') {
      return { allowed: false, reason: 'Destination must be a non-empty string.' };
    }

    let hostname = '';
    try {
      if (/^[a-zA-Z][a-zA-Z0-9+.-]*:\/\//.test(raw)) {
        const parsed = new URL(raw);
        hostname = parsed.hostname;
      } else {
        // Raw host or host:port
        hostname = raw.split('/')[0].split(':')[0];
      }
    } catch {
      return {
        allowed: false,
        destination: raw,
        reason: `Malformed destination URL: "${raw}"`,
      };
    }

    hostname = hostname.toLowerCase();

    // 1. Localhost check
    const isLocalhost =
      hostname === 'localhost' ||
      hostname === '127.0.0.1' ||
      hostname === '0.0.0.0' ||
      hostname === '::1';

    if (isLocalhost) {
      if (this.allowLocalhost) {
        return { allowed: true, destination: hostname };
      }
      return {
        allowed: false,
        destination: hostname,
        isExfiltrationRisk: false,
        reason: `Localhost or loopback access prohibited: "${raw}"`,
      };
    }

    // 2. IP Literal Check
    const isIpLiteral = /^\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}$/.test(hostname);
    if (isIpLiteral) {
      if (this.allowedIps.has(hostname)) {
        return { allowed: true, destination: hostname };
      }
      return {
        allowed: false,
        destination: hostname,
        isExfiltrationRisk: true,
        reason: `Outbound connection to unapproved IP address "${hostname}" blocked.`,
      };
    }

    // 3. Domain Allowlist Check
    if (this.allowedDomains.length === 0) {
      // If no domain allowlist is configured, default allow external domain
      return { allowed: true, destination: hostname };
    }

    const matchesAllowlist = this.allowedDomains.some((pattern) =>
      this.matchesPattern(hostname, pattern)
    );

    if (!matchesAllowlist) {
      return {
        allowed: false,
        destination: hostname,
        isExfiltrationRisk: true,
        reason: `Unauthorized destination domain "${hostname}" rejected. Allowed domains: [${this.allowedDomains.join(', ')}]`,
      };
    }

    return { allowed: true, destination: hostname };
  }

  /**
   * Evaluates a ToolCallContext against the outbound destination allowlist.
   */
  public evaluateContext(ctx: ToolCallContext): RuleViolation | null {
    if (!ctx.params || typeof ctx.params !== 'object') {
      return null;
    }

    const destinations = this.extractDestinations(ctx.params);
    if (destinations.length === 0) {
      return null;
    }

    for (const dest of destinations) {
      const check = this.validateDestination(dest);
      if (!check.allowed) {
        const verdict = this.action === 'CONFIRM' ? Verdict.CONFIRM : Verdict.BLOCK;
        const severity = check.isExfiltrationRisk ? 'critical' : 'high';

        return {
          ruleId: 'network-outbound-domain-allowlist',
          ruleName: 'Outbound Destination Domain & IP Allowlist Guard',
          severity,
          verdict,
          reason: check.reason || `Blocked outbound connection to "${dest}".`,
        };
      }
    }

    return null;
  }

  /**
   * Creates an AgentSentinel SentinelRule for outbound network allowlist.
   */
  public createSentinelRule(): SentinelRule {
    return {
      id: 'network-outbound-domain-allowlist',
      name: 'Outbound Destination Domain & IP Allowlist Guard',
      category: 'network',
      priority: 970,
      enabled: true,
      evaluate: (ctx: ToolCallContext): RuleViolation | null => {
        return this.evaluateContext(ctx);
      },
    };
  }
}

export function createNetworkAllowlistRule(options?: NetworkAllowlistOptions): SentinelRule {
  const guard = new NetworkAllowlistGuard(options);
  return guard.createSentinelRule();
}
