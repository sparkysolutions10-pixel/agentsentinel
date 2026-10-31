/**
 * AgentSentinel - SEP-41 Token Transfer Amount Ceiling Rule
 * Enforces strict transfer amount ceilings per transaction on Soroban & Stellar tokens
 * to protect autonomous AI agents from wallet drainage and unauthorized large asset outflows.
 */

import { SentinelRule, ToolCallContext, RuleViolation, Verdict, ToolCategory } from '../types.js';

export interface SorobanTokenCeilingConfig {
  maxTransferAmount?: number; // default: 100,000 units
  whitelistedRecipients?: string[];
}

export function createSorobanTokenTransferCeilingRule(config: SorobanTokenCeilingConfig = {}): SentinelRule {
  const maxAmount = config.maxTransferAmount ?? 100000;
  const whitelisted = new Set((config.whitelistedRecipients || []).map(r => r.toUpperCase()));

  return {
    id: 'soroban-token-transfer-ceiling',
    name: 'Soroban SEP-41 Token Transfer Ceiling',
    category: 'custom' as ToolCategory,
    priority: 80,
    enabled: true,

    evaluate(context: ToolCallContext): RuleViolation | null {
      const tool = context.toolName.toLowerCase();
      if (!tool.includes('transfer') && !tool.includes('soroban') && !tool.includes('token') && !tool.includes('stellar')) {
        return null;
      }

      const params = context.params || {};
      const recipient = String(params.to || params.recipient || params.destination || '').toUpperCase();
      if (whitelisted.has(recipient)) {
        return null;
      }

      const amountRaw = params.amount ?? params.transferAmount ?? params.value ?? params.quantity;
      if (amountRaw === undefined || amountRaw === null) {
        return null;
      }

      const amount = Number(amountRaw);
      if (isNaN(amount)) {
        return null;
      }

      if (amount > maxAmount) {
        return {
          ruleId: 'soroban-token-transfer-ceiling',
          ruleName: 'Soroban SEP-41 Token Transfer Ceiling',
          severity: 'critical',
          verdict: Verdict.BLOCK,
          reason: `Token transfer amount (${amount.toLocaleString()}) exceeds the maximum safety ceiling (${maxAmount.toLocaleString()}). Potential wallet drain intercepted.`,
          detectedPattern: `TRANSFER_CEILING_EXCEEDED:${amount}>${maxAmount}`,
        };
      }

      return null;
    }
  };
}
