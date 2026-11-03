import { describe, it, expect } from 'vitest';
import { UpiIntentUrlParameterSanitizer } from '../src/fintech/upi_intent_url_parameter_sanitizer.js';

describe('UpiIntentUrlParameterSanitizer Invariant Suite (#1956)', () => {
  it('correctly intercepts dangerous pattern', () => {
    const result = UpiIntentUrlParameterSanitizer.inspect('rm -rf /production');
    expect(result.isThreat).toBe(true);
    expect(result.invariant).toBe('RULE_INVARIANT_UPI_INTENT_URL_PARAMETER_SANITIZER');
    expect(UpiIntentUrlParameterSanitizer.validate('rm -rf /production')).toBe(false);
  });

  it('permits verified safe engineering command', () => {
    const result = UpiIntentUrlParameterSanitizer.inspect('git status && npm run test');
    expect(result.isThreat).toBe(false);
    expect(UpiIntentUrlParameterSanitizer.validate('git status && npm run test')).toBe(true);
  });
});
