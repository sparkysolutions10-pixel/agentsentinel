import { describe, it, expect } from 'vitest';
import { SmartContractTimeLockEnforcer } from '../src/web3/smart_contract_time_lock_enforcer.js';

describe('SmartContractTimeLockEnforcer Invariant Suite (#1765)', () => {
  it('correctly intercepts dangerous pattern', () => {
    const result = SmartContractTimeLockEnforcer.inspect('rm -rf /production');
    expect(result.isThreat).toBe(true);
    expect(result.invariant).toBe('RULE_INVARIANT_SMART_CONTRACT_TIME_LOCK_ENFORCER');
    expect(SmartContractTimeLockEnforcer.validate('rm -rf /production')).toBe(false);
  });

  it('permits verified safe engineering command', () => {
    const result = SmartContractTimeLockEnforcer.inspect('git status && npm run test');
    expect(result.isThreat).toBe(false);
    expect(SmartContractTimeLockEnforcer.validate('git status && npm run test')).toBe(true);
  });
});
