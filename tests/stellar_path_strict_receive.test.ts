import { describe, it, expect } from 'vitest';
import { createStellarPathStrictReceiveClampRule } from '../src/web3/stellar_path_strict_receive.js';
import { Verdict } from '../src/types.js';

describe('StellarPathStrictReceiveClampRule', () => {
  it('allows strict receive payments with a reasonable sendMax buffer', () => {
    const rule = createStellarPathStrictReceiveClampRule({ maxBudgetMultiplier: 1.05 });
    const violation = rule.evaluate({
      toolName: 'stellar_path_payment_strict_receive',
      params: { expectedSendAmount: 100, sendMax: 103 }
    });
    expect(violation).toBeNull();
  });

  it('blocks payments missing sendMax ceiling', () => {
    const rule = createStellarPathStrictReceiveClampRule();
    const violation = rule.evaluate({
      toolName: 'stellar_path_payment_strict_receive',
      params: { expectedSendAmount: 100, sendMax: 0 }
    });
    expect(violation).not.toBeNull();
    expect(violation?.verdict).toBe(Verdict.BLOCK);
    expect(violation?.detectedPattern).toContain('PATH_PAYMENT_MISSING_SEND_MAX');
  });

  it('blocks payments with excessive sendMax budget buffers', () => {
    const rule = createStellarPathStrictReceiveClampRule({ maxBudgetMultiplier: 1.05 });
    const violation = rule.evaluate({
      toolName: 'stellar_path_payment_strict_receive',
      params: { expectedSendAmount: 100, sendMax: 150 } // 50% buffer > 5%
    });
    expect(violation).not.toBeNull();
    expect(violation?.verdict).toBe(Verdict.BLOCK);
    expect(violation?.detectedPattern).toContain('SEND_MAX_EXCEEDS_BUFFER');
  });
});
