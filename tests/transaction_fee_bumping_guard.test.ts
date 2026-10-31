import { describe, it, expect } from 'vitest';
import { createTransactionFeeBumpingRule } from '../src/web3/transaction_fee_bumping_guard.js';
import { ToolCallContext, Verdict } from '../src/types.js';

describe('TransactionFeeBumpingGuard', () => {
  const rule = createTransactionFeeBumpingRule({ maxBaseFeeStroops: 5000 });

  it('allows fee bump within configured limits', () => {
    const context: ToolCallContext = {
      id: 'tx_feebump_safe',
      toolName: 'stellar_feebump_transaction',
      params: { baseFee: 2000, totalFee: 2000 },
      timestamp: Date.now()
    };

    const violation = rule.evaluate(context);
    expect(violation).toBeNull();
  });

  it('blocks excessive fee bump exceeding base fee ceiling', () => {
    const context: ToolCallContext = {
      id: 'tx_feebump_excessive',
      toolName: 'stellar_feebump_transaction',
      params: { baseFee: 15000 },
      timestamp: Date.now()
    };

    const violation = rule.evaluate(context);
    expect(violation).not.toBeNull();
    expect(violation?.verdict).toBe(Verdict.BLOCK);
    expect(violation?.detectedPattern).toContain('EXCESSIVE_FEE_BUMP:15000>5000');
  });
});
