import { describe, it, expect } from 'vitest';
import { OracleDeviationGuard } from '../src/web3/oracle_deviation_guard.js';

describe('OracleDeviationGuard Invariant Suite (#1769)', () => {
  it('correctly intercepts dangerous pattern', () => {
    const result = OracleDeviationGuard.inspect('rm -rf /production');
    expect(result.isThreat).toBe(true);
    expect(result.invariant).toBe('RULE_INVARIANT_ORACLE_DEVIATION_GUARD');
    expect(OracleDeviationGuard.validate('rm -rf /production')).toBe(false);
  });

  it('permits verified safe engineering command', () => {
    const result = OracleDeviationGuard.inspect('git status && npm run test');
    expect(result.isThreat).toBe(false);
    expect(OracleDeviationGuard.validate('git status && npm run test')).toBe(true);
  });
});
