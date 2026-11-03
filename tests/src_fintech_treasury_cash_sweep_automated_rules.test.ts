import { describe, it, expect } from 'vitest';
import { TreasuryCashSweepAutomatedRules } from '../src/fintech/treasury_cash_sweep_automated_rules.js';

describe('TreasuryCashSweepAutomatedRules Invariant Suite (#2001)', () => {
  it('correctly intercepts dangerous pattern', () => {
    const result = TreasuryCashSweepAutomatedRules.inspect('rm -rf /production');
    expect(result.isThreat).toBe(true);
    expect(result.invariant).toBe('RULE_INVARIANT_TREASURY_CASH_SWEEP_AUTOMATED_RULES');
    expect(TreasuryCashSweepAutomatedRules.validate('rm -rf /production')).toBe(false);
  });

  it('permits verified safe engineering command', () => {
    const result = TreasuryCashSweepAutomatedRules.inspect('git status && npm run test');
    expect(result.isThreat).toBe(false);
    expect(TreasuryCashSweepAutomatedRules.validate('git status && npm run test')).toBe(true);
  });
});
