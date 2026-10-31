/**
 * AgentSentinel - Bridge Finality Delay Monitor
 * Enforces minimum ledger / block confirmation delays between lock and claim
 * to guard against chain reorganization double-spending and unfinalized state execution.
 */

import { SentinelRule, ToolCallContext, RuleViolation, Verdict, ToolCategory } from '../types.js';

export interface BridgeFinalityDelayConfig {
  minConfirmations?: number; // default: 30 ledgers/blocks
}

export function createBridgeFinalityDelayRule(config: BridgeFinalityDelayConfig = {}): SentinelRule {
  const minConfirmations = config.minConfirmations ?? 30;

  return {
    id: 'bridge-finality-delay-monitor',
    name: 'Bridge Finality Delay Monitor',
    category: 'custom' as ToolCategory,
    priority: 85,
    enabled: true,

    evaluate(context: ToolCallContext): RuleViolation | null {
      const tool = context.toolName.toLowerCase();
      if (!tool.includes('bridge') && !tool.includes('claim') && !tool.includes('release') && !tool.includes('settle')) {
        return null;
      }

      const params = context.params || {};
      const confirmationsRaw = params.confirmations ?? params.elapsedLedgers ?? params.blockConfirmations ?? params.ledgerCount;

      if (confirmationsRaw === undefined || confirmationsRaw === null) {
        return {
          ruleId: 'bridge-finality-delay-monitor',
          ruleName: 'Bridge Finality Delay Monitor',
          severity: 'high',
          verdict: Verdict.BLOCK,
          reason: 'Bridge claim blocked: confirmation count missing. Cannot establish finality proof.',
          detectedPattern: 'MISSING_CONFIRMATION_COUNT'
        };
      }

      const confirmations = Number(confirmationsRaw);
      if (isNaN(confirmations) || confirmations < minConfirmations) {
        return {
          ruleId: 'bridge-finality-delay-monitor',
          ruleName: 'Bridge Finality Delay Monitor',
          severity: 'high',
          verdict: Verdict.BLOCK,
          reason: `Bridge claim blocked: confirmation depth (${confirmations}) is below the required finality threshold (${minConfirmations}). Reorg risk intercepted.`,
          detectedPattern: `INSUFFICIENT_FINALITY_CONFIRMATIONS:${confirmations}<${minConfirmations}`
        };
      }

      return null;
    }
  };
}
