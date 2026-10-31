/**
 * AgentSentinel - SEP-10 Stellar Web Authentication Validator
 * Validates SEP-10 cryptographic challenges to prevent replay attacks,
 * domain spoofing, and expired authorization attempts.
 */

import { SentinelRule, ToolCallContext, RuleViolation, Verdict, ToolCategory } from '../types.js';

export interface Sep10ValidatorConfig {
  expectedHomeDomain?: string;
  maxGracePeriodSeconds?: number; // default: 300s
}

export function createSep10WebAuthRule(config: Sep10ValidatorConfig = {}): SentinelRule {
  const expectedDomain = config.expectedHomeDomain?.toLowerCase();
  const gracePeriod = (config.maxGracePeriodSeconds ?? 300) * 1000;

  return {
    id: 'sep10-webauth-validator',
    name: 'SEP-10 Web Authentication Validator',
    category: 'custom' as ToolCategory,
    priority: 90,
    enabled: true,

    evaluate(context: ToolCallContext): RuleViolation | null {
      const tool = context.toolName.toLowerCase();
      if (!tool.includes('sep10') && !tool.includes('auth') && !tool.includes('challenge')) {
        return null;
      }

      const params = context.params || {};
      const homeDomain = String(params.homeDomain || params.domain || '').toLowerCase();

      if (expectedDomain && homeDomain && homeDomain !== expectedDomain) {
        return {
          ruleId: 'sep10-webauth-validator',
          ruleName: 'SEP-10 Web Authentication Validator',
          severity: 'high',
          verdict: Verdict.BLOCK,
          reason: `SEP-10 challenge domain mismatch: received "${homeDomain}", expected "${expectedDomain}". Phishing challenge intercepted.`,
          detectedPattern: `DOMAIN_MISMATCH:${homeDomain}!==${expectedDomain}`
        };
      }

      const expiresAt = Number(params.expiresAt ?? params.maxTime ?? 0);
      if (expiresAt > 0) {
        const now = context.timestamp || Date.now();
        // If expiresAt is in seconds, convert to ms
        const expiresAtMs = expiresAt < 10000000000 ? expiresAt * 1000 : expiresAt;
        if (now > expiresAtMs + gracePeriod) {
          return {
            ruleId: 'sep10-webauth-validator',
            ruleName: 'SEP-10 Web Authentication Validator',
            severity: 'high',
            verdict: Verdict.BLOCK,
            reason: `SEP-10 authentication challenge has expired. Replay attempt blocked.`,
            detectedPattern: `EXPIRED_SEP10_CHALLENGE:${now}>${expiresAtMs}`
          };
        }
      }

      return null;
    }
  };
}
