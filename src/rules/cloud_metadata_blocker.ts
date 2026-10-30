/**
 * AgentSentinel Cloud Metadata Service Endpoint Access Blocker.
 * Intercepts and strictly prevents Server-Side Request Forgery (SSRF) attempts
 * targeting AWS (IMDSv1/v2), GCP, Azure, Alibaba Cloud, and Kubernetes metadata services.
 * Defeats decimal, octal, hex, and IPv6 address obfuscations.
 */

import { SentinelRule, ToolCallContext, RuleViolation, Verdict } from '../types.js';

export interface MetadataDetectionResult {
  isMetadataSSRF: boolean;
  provider?: 'AWS' | 'GCP' | 'Azure' | 'Kubernetes' | 'Alibaba' | 'DigitalOcean' | 'Generic';
  detectedTarget?: string;
  reason?: string;
}

const METADATA_HOST_PATTERNS: Array<{ provider: MetadataDetectionResult['provider']; pattern: RegExp; desc: string }> = [
  // AWS / Generic Link-Local 169.254.169.254
  { provider: 'AWS', pattern: /(?:^|:\/\/|@|\b)169\.254\.169\.254(?::\d+)?(?:\/|\b|$)/i, desc: 'AWS/Generic Link-Local IMDS (169.254.169.254)' },
  { provider: 'AWS', pattern: /(?:^|:\/\/|@|\b)instance-data(?::\d+)?(?:\/|\b|$)/i, desc: 'AWS Legacy instance-data domain' },
  { provider: 'AWS', pattern: /(?:^|:\/\/|@|\b)\[?fd00:ec2::254\]?(?::\d+)?(?:\/|\b|$)/i, desc: 'AWS IPv6 IMDS ([fd00:ec2::254])' },

  // GCP Metadata
  { provider: 'GCP', pattern: /(?:^|:\/\/|@|\b)metadata\.google\.internal(?::\d+)?(?:\/|\b|$)/i, desc: 'GCP Compute Engine metadata.google.internal' },
  { provider: 'GCP', pattern: /(?:^|:\/\/|@|\b)metadata\.goog(?::\d+)?(?:\/|\b|$)/i, desc: 'GCP Metadata short domain' },

  // Azure Metadata (169.254.169.254 & 168.63.129.16)
  { provider: 'Azure', pattern: /(?:^|:\/\/|@|\b)168\.63\.129\.16(?::\d+)?(?:\/|\b|$)/i, desc: 'Azure WireServer internal IP (168.63.129.16)' },

  // Alibaba Cloud ECS (100.100.100.200)
  { provider: 'Alibaba', pattern: /(?:^|:\/\/|@|\b)100\.100\.100\.200(?::\d+)?(?:\/|\b|$)/i, desc: 'Alibaba Cloud ECS metadata endpoint (100.100.100.200)' },

  // Kubernetes API / Etcd internal endpoints
  { provider: 'Kubernetes', pattern: /(?:^|:\/\/|@|\b)kubernetes\.default(?:\.svc)?(?:\.cluster\.local)?(?::\d+)?(?:\/|\b|$)/i, desc: 'Kubernetes in-cluster API service' },

  // IP Obfuscations for 169.254.169.254 (2852039166 in decimal, 0xa9fea9fe in hex, 0251.0376.0251.0376 in octal)
  { provider: 'AWS', pattern: /(?:^|:\/\/|@|\b)2852039166(?::\d+)?(?:\/|\b|$)/i, desc: 'Decimal-encoded 169.254.169.254' },
  { provider: 'AWS', pattern: /(?:^|:\/\/|@|\b)0x[aA]9[fF][eE][aA]9[fF][eE](?::\d+)?(?:\/|\b|$)/i, desc: 'Hex-encoded 0xa9fea9fe (169.254.169.254)' },
  { provider: 'AWS', pattern: /(?:^|:\/\/|@|\b)0251\.0376\.0251\.0376(?::\d+)?(?:\/|\b|$)/i, desc: 'Octal-encoded 169.254.169.254' },
  { provider: 'AWS', pattern: /(?:^|:\/\/|@|\b)\[?::ffff:169\.254\.169\.254\]?(?::\d+)?(?:\/|\b|$)/i, desc: 'IPv4-mapped IPv6 169.254.169.254' },
];

/**
 * Scans a target text string for cloud metadata service endpoints.
 */
export function detectCloudMetadataSSRF(input: string): MetadataDetectionResult {
  if (!input || typeof input !== 'string') {
    return { isMetadataSSRF: false };
  }

  // URL-decode input to catch encoded evasion attempts
  let decoded = input;
  try {
    decoded = decodeURIComponent(input);
  } catch {
    // ignore malformed decode
  }

  for (const entry of METADATA_HOST_PATTERNS) {
    if (entry.pattern.test(input) || entry.pattern.test(decoded)) {
      return {
        isMetadataSSRF: true,
        provider: entry.provider,
        detectedTarget: entry.desc,
        reason: `Prohibited cloud metadata service access detected (${entry.desc}). Potential SSRF credential theft attack.`,
      };
    }
  }

  return { isMetadataSSRF: false };
}

export class CloudMetadataBlocker {
  /**
   * Deep scans all parameters and properties in ToolCallContext.
   */
  public evaluateContext(ctx: ToolCallContext): RuleViolation | null {
    if (!ctx.params || typeof ctx.params !== 'object') {
      return null;
    }

    const checkValue = (val: unknown): RuleViolation | null => {
      if (typeof val === 'string') {
        const detection = detectCloudMetadataSSRF(val);
        if (detection.isMetadataSSRF) {
          return {
            ruleId: 'network-block-cloud-metadata-ssrf',
            ruleName: 'Block Cloud Metadata Service Access (AWS/GCP/Azure/K8s IMDS)',
            severity: 'critical',
            verdict: Verdict.BLOCK,
            reason: detection.reason || 'Cloud metadata service access prohibited.',
            detectedPattern: detection.detectedTarget,
          };
        }
      } else if (Array.isArray(val)) {
        for (const item of val) {
          const res = checkValue(item);
          if (res) return res;
        }
      } else if (val !== null && typeof val === 'object') {
        for (const v of Object.values(val)) {
          const res = checkValue(v);
          if (res) return res;
        }
      }
      return null;
    };

    return checkValue(ctx.params);
  }

  public createSentinelRule(): SentinelRule {
    return {
      id: 'network-block-cloud-metadata-ssrf',
      name: 'Block Cloud Metadata Service Access (AWS/GCP/Azure/K8s IMDS)',
      category: 'network',
      priority: 990,
      enabled: true,
      evaluate: (ctx: ToolCallContext): RuleViolation | null => {
        return this.evaluateContext(ctx);
      },
    };
  }
}

export function createCloudMetadataBlockerRule(): SentinelRule {
  const blocker = new CloudMetadataBlocker();
  return blocker.createSentinelRule();
}

export const cloudMetadataBlockerRule: SentinelRule = createCloudMetadataBlockerRule();
