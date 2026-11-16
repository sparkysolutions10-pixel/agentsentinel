/**
 * AgentSentinel - Flash Loan Borrow and Repayment Invariant Verifier
 * Verifies that flash loan balances satisfy the mathematical invariant
 * (repaidAmount >= borrowedAmount + fee) to prevent pool liquidity drainage.
 */
import { SentinelRule } from '../types.js';
export interface SorobanFlashLoanConfig {
    feeBasisPoints?: number;
}
export declare function createSorobanFlashLoanVerifierRule(config?: SorobanFlashLoanConfig): SentinelRule;
//# sourceMappingURL=soroban_flash_loan_verifier.d.ts.map