import { describe, it, expect } from 'vitest';
import { Fips1403PowerOnSelfTestRunner } from '../src/crypto/fips_140_3_power_on_self_test_runner.js';

describe('Fips1403PowerOnSelfTestRunner Invariant Suite (#2032)', () => {
  it('correctly intercepts dangerous pattern', () => {
    const result = Fips1403PowerOnSelfTestRunner.inspect('rm -rf /production');
    expect(result.isThreat).toBe(true);
    expect(result.invariant).toBe('RULE_INVARIANT_FIPS_140_3_POWER_ON_SELF_TEST_RUNNER');
    expect(Fips1403PowerOnSelfTestRunner.validate('rm -rf /production')).toBe(false);
  });

  it('permits verified safe engineering command', () => {
    const result = Fips1403PowerOnSelfTestRunner.inspect('git status && npm run test');
    expect(result.isThreat).toBe(false);
    expect(Fips1403PowerOnSelfTestRunner.validate('git status && npm run test')).toBe(true);
  });
});
