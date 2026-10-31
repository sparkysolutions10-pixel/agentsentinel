/**
 * AgentSentinel - DNS Rebinding & Internal Subnet SSRF Shield
 * Validates Horizon & Soroban RPC endpoint hostnames to block private IP ranges,
 * loopback interfaces (127.0.0.1), and cloud metadata endpoints (169.254.169.254).
 */

import { SentinelRule, ToolCallContext, RuleViolation, Verdict, ToolCategory } from '../types.js';

const FORBIDDEN_IP_PATTERNS = [
  /^127\./,                         // Loopback
  /^169\.254\./,                    // Link-local / Cloud metadata
  /^10\./,                          // RFC1918 Private Class A
  /^172\.(1[6-9]|2[0-9]|3[0-1])\./, // RFC1918 Private Class B
  /^192\.168\./,                   // RFC1918 Private Class C
  /^0\.0\.0\.0$/,                   // Inaddr any
  /^localhost$/i,
  /\.local$/i,
  /\.internal$/i
];

export function createDnsRebindingShieldRule(): SentinelRule {
  return {
    id: 'dns-rebinding-shield',
    name: 'DNS Rebinding & Internal Subnet SSRF Shield',
    category: 'network' as ToolCategory,
    priority: 95,
    enabled: true,

    evaluate(context: ToolCallContext): RuleViolation | null {
      const params = context.params || {};
      const endpoint = String(params.rpcUrl || params.endpoint || params.horizonUrl || params.url || '');

      if (!endpoint) {
        return null;
      }

      try {
        const parsed = new URL(endpoint);
        const hostname = parsed.hostname.toLowerCase();

        for (const pattern of FORBIDDEN_IP_PATTERNS) {
          if (pattern.test(hostname)) {
            return {
              ruleId: 'dns-rebinding-shield',
              ruleName: 'DNS Rebinding & Internal Subnet SSRF Shield',
              severity: 'critical',
              verdict: Verdict.BLOCK,
              reason: `RPC endpoint "${endpoint}" resolves to restricted private/internal subnet ("${hostname}"). SSRF and DNS rebinding exploit blocked.`,
              detectedPattern: `FORBIDDEN_INTERNAL_HOST:${hostname}`
            };
          }
        }
      } catch {
        // Invalid URL format
        return {
          ruleId: 'dns-rebinding-shield',
          ruleName: 'DNS Rebinding & Internal Subnet SSRF Shield',
          severity: 'high',
          verdict: Verdict.BLOCK,
          reason: `Malformed RPC endpoint URL: "${endpoint}".`,
          detectedPattern: `MALFORMED_RPC_URL:${endpoint}`
        };
      }

      return null;
    }
  };
}
