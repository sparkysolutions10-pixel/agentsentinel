import { describe, it, expect } from 'vitest';
import { createStellarPathStrictSendClampRule } from '../src/web3/stellar_path_strict_send.js';
import { Verdict } from '../src/types.js';

describe('StellarPathStrictSendClampRule', () => {
  it('allows path payment with safe destMin tolerance', () => {
    const rule = createStellarPathStrictSendClampRule({ maxAllowedSlippagePercent: 1.0 });
    const violation = rule.evaluate({
      toolName: 'stellar_path_payment_strict_send',
      params: { expectedDestAmount: 100, destMin: 99.5 }
    });
    expect(violation).toBeNull();
  });

  it('blocks path payment missing destMin parameter', () => {
    const rule = createStellarPathStrictSendClampRule();
    const violation = rule.evaluate({
      toolName: 'stellar_path_payment_strict_send',
      params: { expectedDestAmount: 100, destMin: 0 }
    });
    expect(violation).not.toBeNull();
    expect(violation?.verdict).toBe(Verdict.BLOCK);
    expect(violation?.detectedPattern).toContain('PATH_PAYMENT_MISSING_DEST_MIN');
  });

  it('blocks path payment when destMin slippage is too loose', () => {
    const rule = createStellarPathStrictSendClampRule({ maxAllowedSlippagePercent: 1.0 });
    const violation = rule.evaluate({
      toolName: 'stellar_path_payment_strict_send',
      params: { expectedDestAmount: 100, destMin: 95 } // 5% slippage > 1%
    });
    expect(violation).not.toBeNull();
    expect(violation?.verdict).toBe(Verdict.BLOCK);
    expect(violation?.detectedPattern).toContain('PATH_SLIPPAGE_EXCEEDED');
  });
});
