/**
 * AgentSentinel - Stellar Asset Clawback & Revocable Flag Detector
 * Checks asset issuer authorization flags (AUTH_REVOCABLE, AUTH_CLAWBACK_ENABLED)
 * before acquiring assets to guard autonomous agents against unexpected fund seizures.
 */

import { SentinelRule, ToolCallContext, RuleViolation, Verdict, ToolCategory } from '../types.js';

export interface ClawbackIssuerConfig {
  allowClawbackAssets?: boolean;
}

export function createClawbackIssuerFlagRule(config: ClawbackIssuerConfig = {}): SentinelRule {
  const allowClawback = config.allowClawbackAssets ?? false;

  return {
    id: 'clawback-issuer-flag-guard',
    name: 'Stellar Asset Clawback & Revocable Flag Guard',
    category: 'custom' as ToolCategory,
    priority: 80,
    enabled: true,

    evaluate(context: ToolCallContext): RuleViolation | null {
      const tool = context.toolName.toLowerCase();
      if (!tool.includes('swap') && !tool.includes('trade') && !tool.includes('trustline') && !tool.includes('buy')) {
        return null;
      }

      if (allowClawback) {
        return null;
      }

      const params = context.params || {};
      const assetFlags = params.assetFlags || params.flags || {};

      const isClawbackEnabled = Boolean(assetFlags.authClawbackEnabled || assetFlags.clawbackEnabled);
      const isRevocable = Boolean(assetFlags.authRevocable || assetFlags.revocable);

      if (isClawbackEnabled || isRevocable) {
        return {
          ruleId: 'clawback-issuer-flag-guard',
          ruleName: 'Stellar Asset Clawback & Revocable Flag Guard',
          severity: 'high',
          verdict: Verdict.BLOCK,
          reason: `Asset acquisition blocked: issuer has enabled ${isClawbackEnabled ? 'AUTH_CLAWBACK_ENABLED' : 'AUTH_REVOCABLE'}. Tokens can be unilaterally seized by issuer.`,
          detectedPattern: `REVOCABLE_ASSET_DETECTED:${isClawbackEnabled ? 'CLAWBACK' : 'REVOCABLE'}`
        };
      }

      return null;
    }
  };
}
