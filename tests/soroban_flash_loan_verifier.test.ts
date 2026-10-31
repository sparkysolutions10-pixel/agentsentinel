import { describe, it, expect } from 'vitest';
import { createSorobanFlashLoanVerifierRule } from '../src/web3/soroban_flash_loan_verifier.js';
import { ToolCallContext, Verdict } from '../src/types.js';

describe('Soroban Flash Loan Invariant Verifier (#921, #922)', () => {
  const rule = createSorobanFlashLoanVerifierRule({ feeBasisPoints: 10 }); // 0.1%

  it('allows flash loans satisfying repayment invariant', () => {
    const ctx: ToolCallContext = {
      id: 'flash-ok-1',
      toolName: 'soroban_flash_loan',
      params: {
        isFlashLoan: true,
        borrowedAmount: 1000000n,
        repaidAmount: 1001000n, // fee = 1000
      },
      timestamp: Date.now(),
    };
    expect(rule.evaluate(ctx)).toBeNull();
  });

  it('blocks unbalanced flash loan draining liquidity pool (#922)', () => {
    const ctx: ToolCallContext = {
      id: 'flash-deficit-1',
      toolName: 'soroban_flash_loan',
      params: {
        isFlashLoan: true,
        borrowedAmount: 1000000n,
        repaidAmount: 990000n, // deficient
      },
      timestamp: Date.now(),
    };
    const violation = rule.evaluate(ctx);
    expect(violation).not.toBeNull();
    expect(violation?.verdict).toBe(Verdict.BLOCK);
    expect(violation?.reason).toContain('Flash loan invariant violated');
  });
});
