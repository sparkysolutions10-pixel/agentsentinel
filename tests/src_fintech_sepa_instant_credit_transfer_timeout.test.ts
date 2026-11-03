import { describe, it, expect } from 'vitest';
import { SepaInstantCreditTransferTimeout } from '../src/fintech/sepa_instant_credit_transfer_timeout.js';

describe('SepaInstantCreditTransferTimeout Invariant Suite (#1981)', () => {
  it('correctly intercepts dangerous pattern', () => {
    const result = SepaInstantCreditTransferTimeout.inspect('rm -rf /production');
    expect(result.isThreat).toBe(true);
    expect(result.invariant).toBe('RULE_INVARIANT_SEPA_INSTANT_CREDIT_TRANSFER_TIMEOUT');
    expect(SepaInstantCreditTransferTimeout.validate('rm -rf /production')).toBe(false);
  });

  it('permits verified safe engineering command', () => {
    const result = SepaInstantCreditTransferTimeout.inspect('git status && npm run test');
    expect(result.isThreat).toBe(false);
    expect(SepaInstantCreditTransferTimeout.validate('git status && npm run test')).toBe(true);
  });
});
