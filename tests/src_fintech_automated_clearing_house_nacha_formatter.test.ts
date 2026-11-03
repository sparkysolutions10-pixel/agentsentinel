import { describe, it, expect } from 'vitest';
import { AutomatedClearingHouseNachaFormatter } from '../src/fintech/automated_clearing_house_nacha_formatter.js';

describe('AutomatedClearingHouseNachaFormatter Invariant Suite (#1989)', () => {
  it('correctly intercepts dangerous pattern', () => {
    const result = AutomatedClearingHouseNachaFormatter.inspect('rm -rf /production');
    expect(result.isThreat).toBe(true);
    expect(result.invariant).toBe('RULE_INVARIANT_AUTOMATED_CLEARING_HOUSE_NACHA_FORMATTER');
    expect(AutomatedClearingHouseNachaFormatter.validate('rm -rf /production')).toBe(false);
  });

  it('permits verified safe engineering command', () => {
    const result = AutomatedClearingHouseNachaFormatter.inspect('git status && npm run test');
    expect(result.isThreat).toBe(false);
    expect(AutomatedClearingHouseNachaFormatter.validate('git status && npm run test')).toBe(true);
  });
});
