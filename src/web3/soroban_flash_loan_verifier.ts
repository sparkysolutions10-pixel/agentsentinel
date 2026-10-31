/**
 * AgentSentinel - Flash Loan Borrow and Repayment Invariant Verifier
 * Verifies that flash loan balances satisfy the mathematical invariant
 * (repaidAmount >= borrowedAmount + fee) to prevent pool liquidity drainage.
 */

import { SentinelRule, ToolCallContext, RuleViolation, Verdict, ToolCategory } from '../types.js';

export interface SorobanFlashLoanConfig {
  feeBasisPoints?: number; // default: 9 (0.09%)
}

export function createSorobanFlashLoanVerifierRule(config: SorobanFlashLoanConfig = {}): SentinelRule {
  const feeBps = config.feeBasisPoints ?? 9;

  return {
    id: 'soroban-flash-loan-verifier',
    name: 'Soroban Flash Loan Invariant Verifier',
    category: 'custom' as ToolCategory,
    priority: 68,
    enabled: true,

    evaluate(context: ToolCallContext): RuleViolation | null {
      const tool = context.toolName.toLowerCase();
      if (!tool.includes('soroban') && !tool.includes('stellar') && !tool.includes('flash_loan') && !tool.includes('borrow')) {
        return null;
      }

      const params = context.params || {};
      const isFlashLoan = Boolean(params.isFlashLoan || tool.includes('flash_loan') || params.operation === 'flash_loan');

      if (isFlashLoan) {
        const borrowed = BigInt(params.borrowedAmount || params.amount || 0);
        const repaid = BigInt(params.repaidAmount || params.returnAmount || 0);
        const fee = (borrowed * BigInt(feeBps)) / 10000n;
        const requiredReturn = borrowed + fee;

        if (borrowed > 0n && repaid < requiredReturn) {
          return {
            ruleId: 'soroban-flash-loan-verifier',
            ruleName: 'Soroban Flash Loan Invariant Verifier',
            severity: 'critical',
            verdict: Verdict.BLOCK,
            reason: `Flash loan invariant violated: borrowed ${borrowed} stroops with required fee ${fee} stroops (total ${requiredReturn}), but returned only ${repaid} stroops. Pool drain risk.`,
            detectedPattern: `FLASH_LOAN_INVARIANT_DEFICIT:${repaid}<${requiredReturn}`,
          };
        }
      }

      return null;
    }
  };
}
