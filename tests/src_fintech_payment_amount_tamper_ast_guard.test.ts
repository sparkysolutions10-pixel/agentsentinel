import { describe, it, expect } from 'vitest';
import { PaymentAmountTamperAstGuard } from '../src/fintech/payment_amount_tamper_ast_guard.js';

describe('PaymentAmountTamperAstGuard Invariant Suite (#1957)', () => {
  it('correctly intercepts dangerous pattern', () => {
    const result = PaymentAmountTamperAstGuard.inspect('rm -rf /production');
    expect(result.isThreat).toBe(true);
    expect(result.invariant).toBe('RULE_INVARIANT_PAYMENT_AMOUNT_TAMPER_AST_GUARD');
    expect(PaymentAmountTamperAstGuard.validate('rm -rf /production')).toBe(false);
  });

  it('permits verified safe engineering command', () => {
    const result = PaymentAmountTamperAstGuard.inspect('git status && npm run test');
    expect(result.isThreat).toBe(false);
    expect(PaymentAmountTamperAstGuard.validate('git status && npm run test')).toBe(true);
  });
});
