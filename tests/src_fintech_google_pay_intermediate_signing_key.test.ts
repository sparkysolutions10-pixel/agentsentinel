import { describe, it, expect } from 'vitest';
import { GooglePayIntermediateSigningKey } from '../src/fintech/google_pay_intermediate_signing_key.js';

describe('GooglePayIntermediateSigningKey Invariant Suite (#1980)', () => {
  it('correctly intercepts dangerous pattern', () => {
    const result = GooglePayIntermediateSigningKey.inspect('rm -rf /production');
    expect(result.isThreat).toBe(true);
    expect(result.invariant).toBe('RULE_INVARIANT_GOOGLE_PAY_INTERMEDIATE_SIGNING_KEY');
    expect(GooglePayIntermediateSigningKey.validate('rm -rf /production')).toBe(false);
  });

  it('permits verified safe engineering command', () => {
    const result = GooglePayIntermediateSigningKey.inspect('git status && npm run test');
    expect(result.isThreat).toBe(false);
    expect(GooglePayIntermediateSigningKey.validate('git status && npm run test')).toBe(true);
  });
});
