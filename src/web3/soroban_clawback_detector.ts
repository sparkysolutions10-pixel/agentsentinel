/**
 * AgentSentinel - Clawback and Frozen Token Flag Detector
 * Inspects Stellar and Soroban asset flags for clawback_enabled and auth_revocable
 * to protect autonomous agents from trading or accepting reversible, high-risk assets.
 */

import { SentinelRule, ToolCallContext, RuleViolation, Verdict, ToolCategory } from '../types.js';

export interface SorobanClawbackConfig {
  blockOnClawbackEnabled?: boolean; // default: true
}

export function createSorobanClawbackDetectorRule(config: SorobanClawbackConfig = {}): SentinelRule {
  const blockOnClawback = config.blockOnClawbackEnabled ?? true;

  return {
    id: 'soroban-clawback-detector',
    name: 'Soroban Clawback & Frozen Asset Detector',
    category: 'custom' as ToolCategory,
    priority: 86,
    enabled: true,

    evaluate(context: ToolCallContext): RuleViolation | null {
      const tool = context.toolName.toLowerCase();
      if (!tool.includes('trade') && !tool.includes('swap') && !tool.includes('token') && !tool.includes('asset') && !tool.includes('soroban')) {
        return null;
      }

      const params = context.params || {};
      const assetFlags = params.flags || params.assetFlags || {};
      const clawbackEnabled = Boolean(
        assetFlags.clawback_enabled ||
        assetFlags.auth_clawback_enabled ||
        params.clawbackEnabled ||
        params.isClawbackEnabled
      );

      const revocable = Boolean(
        assetFlags.auth_revocable ||
        params.authRevocable
      );

      if (clawbackEnabled || revocable) {
        return {
          ruleId: 'soroban-clawback-detector',
          ruleName: 'Soroban Clawback & Frozen Asset Detector',
          severity: 'high',
          verdict: blockOnClawback ? Verdict.BLOCK : Verdict.CONFIRM,
          reason: `Asset possesses clawback (${clawbackEnabled}) or revocable authorization (${revocable}) flags. Issuer can unilaterally confiscate tokens.`,
          detectedPattern: `CLAWBACK_FLAG_DETECTED:clawback=${clawbackEnabled},revocable=${revocable}`,
        };
      }

      return null;
    }
  };
}
