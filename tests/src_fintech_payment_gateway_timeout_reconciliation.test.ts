import { describe, it, expect } from 'vitest';
import { PaymentGatewayTimeoutReconciliation } from '../src/fintech/payment_gateway_timeout_reconciliation.js';

describe('PaymentGatewayTimeoutReconciliation Invariant Suite (#1962)', () => {
  it('correctly intercepts dangerous pattern', () => {
    const result = PaymentGatewayTimeoutReconciliation.inspect('rm -rf /production');
    expect(result.isThreat).toBe(true);
    expect(result.invariant).toBe('RULE_INVARIANT_PAYMENT_GATEWAY_TIMEOUT_RECONCILIATION');
    expect(PaymentGatewayTimeoutReconciliation.validate('rm -rf /production')).toBe(false);
  });

  it('permits verified safe engineering command', () => {
    const result = PaymentGatewayTimeoutReconciliation.inspect('git status && npm run test');
    expect(result.isThreat).toBe(false);
    expect(PaymentGatewayTimeoutReconciliation.validate('git status && npm run test')).toBe(true);
  });
});
