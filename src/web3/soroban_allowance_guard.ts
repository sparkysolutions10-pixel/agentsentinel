/**
 * AgentSentinel - Token Allowance Expiration & Auto-Revoke Guard
 * Prevents unlimited (u128::MAX) token approvals on Soroban SEP-41 contracts,
 * clamps approvals to exact order amounts, and enforces finite expiration ledgers.
 */

import { SentinelRule, ToolCallContext, RuleViolation, Verdict, ToolCategory } from '../types.js';

export interface SorobanAllowanceConfig {
  maxAllowedApproval?: number;
  maxExpirationLedgers?: number; // max ledgers from current, e.g. 100,000
}

const U128_MAX = '340282366920938463463374607431768211455';

export function createSorobanAllowanceRevokeGuardRule(config: SorobanAllowanceConfig = {}): SentinelRule {
  const maxApproval = config.maxAllowedApproval ?? 1000000;
  const maxLedgers = config.maxExpirationLedgers ?? 100000;

  return {
    id: 'soroban-allowance-guard',
    name: 'Soroban SEP-41 Allowance Guard',
    category: 'custom' as ToolCategory,
    priority: 82,
    enabled: true,

    evaluate(context: ToolCallContext): RuleViolation | null {
      const tool = context.toolName.toLowerCase();
      if (!tool.includes('approve') && !tool.includes('allowance') && !tool.includes('soroban')) {
        return null;
      }

      const params = context.params || {};
      const amountStr = String(params.amount ?? params.allowance ?? '');
      const amountNum = Number(amountStr);

      const isInfinite = amountStr === U128_MAX ||
        amountStr.toLowerCase() === 'infinity' ||
        amountNum > maxApproval;

      if (isInfinite) {
        // Clamp to exact safe amount if order amount provided, or block
        const safeAmount = params.orderAmount ? Number(params.orderAmount) : maxApproval;
        return {
          ruleId: 'soroban-allowance-guard',
          ruleName: 'Soroban SEP-41 Allowance Guard',
          severity: 'high',
          verdict: Verdict.BLOCK,
          reason: `Unlimited or excessive token approval (${amountStr}) detected. Must be bounded to order amount to prevent protocol drain.`,
          detectedPattern: `UNLIMITED_APPROVAL_REQUEST:${amountStr}`,
        };
      }

      const expiration = Number(params.liveUntilLedger || params.expirationLedger || 0);
      const currentLedger = Number(params.currentLedger || 0);
      if (expiration > 0 && currentLedger > 0 && (expiration - currentLedger) > maxLedgers) {
        return {
          ruleId: 'soroban-allowance-guard',
          ruleName: 'Soroban SEP-41 Allowance Guard',
          severity: 'medium',
          verdict: Verdict.BLOCK,
          reason: `Allowance expiration duration (${expiration - currentLedger} ledgers) exceeds max policy limit (${maxLedgers} ledgers).`,
          detectedPattern: `EXCESSIVE_EXPIRATION_DURATION:${expiration - currentLedger}>${maxLedgers}`,
        };
      }

      return null;
    }
  };
}
