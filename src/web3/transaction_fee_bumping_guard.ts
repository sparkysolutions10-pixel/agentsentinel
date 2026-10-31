/**
 * AgentSentinel - Stellar Fee Bump Transaction Guard
 * Clamps maximum base fee surges on FeeBumpTransaction operations
 * to prevent runaway bidding wars and gas drain during network congestion.
 */

import { SentinelRule, ToolCallContext, RuleViolation, Verdict, ToolCategory } from '../types.js';

export interface FeeBumpingConfig {
  maxBaseFeeStroops?: number; // default: 5,000 stroops (0.0005 XLM)
  maxTotalFeeStroops?: number; // default: 50,000 stroops (0.005 XLM)
}

export function createTransactionFeeBumpingRule(config: FeeBumpingConfig = {}): SentinelRule {
  const maxBaseFee = config.maxBaseFeeStroops ?? 5000;
  const maxTotalFee = config.maxTotalFeeStroops ?? 50000;

  return {
    id: 'transaction-fee-bumping-guard',
    name: 'Stellar Transaction Fee Bumping Guard',
    category: 'custom' as ToolCategory,
    priority: 85,
    enabled: true,

    evaluate(context: ToolCallContext): RuleViolation | null {
      const tool = context.toolName.toLowerCase();
      if (!tool.includes('feebump') && !tool.includes('bump_fee') && !tool.includes('fee_bump')) {
        return null;
      }

      const params = context.params || {};
      const baseFee = Number(params.baseFee ?? params.fee ?? params.maxFee ?? 0);

      if (baseFee > maxBaseFee) {
        return {
          ruleId: 'transaction-fee-bumping-guard',
          ruleName: 'Stellar Transaction Fee Bumping Guard',
          severity: 'high',
          verdict: Verdict.BLOCK,
          reason: `Fee bumping surge ceiling exceeded: requested base fee (${baseFee} stroops) exceeds safety clamp (${maxBaseFee} stroops). Bidding war halted.`,
          detectedPattern: `EXCESSIVE_FEE_BUMP:${baseFee}>${maxBaseFee}`
        };
      }

      const totalFee = Number(params.totalFee ?? baseFee);
      if (totalFee > maxTotalFee) {
        return {
          ruleId: 'transaction-fee-bumping-guard',
          ruleName: 'Stellar Transaction Fee Bumping Guard',
          severity: 'high',
          verdict: Verdict.BLOCK,
          reason: `Total fee-bump expenditure (${totalFee} stroops) exceeds safe maximum allowance (${maxTotalFee} stroops).`,
          detectedPattern: `TOTAL_FEE_BUMP_EXCEEDED:${totalFee}>${maxTotalFee}`
        };
      }

      return null;
    }
  };
}
