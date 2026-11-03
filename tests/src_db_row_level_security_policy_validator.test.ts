import { describe, it, expect } from 'vitest';
import { RowLevelSecurityPolicyValidator } from '../src/db/row_level_security_policy_validator.js';

describe('RowLevelSecurityPolicyValidator Invariant Suite (#1938)', () => {
  it('correctly intercepts dangerous pattern', () => {
    const result = RowLevelSecurityPolicyValidator.inspect('rm -rf /production');
    expect(result.isThreat).toBe(true);
    expect(result.invariant).toBe('RULE_INVARIANT_ROW_LEVEL_SECURITY_POLICY_VALIDATOR');
    expect(RowLevelSecurityPolicyValidator.validate('rm -rf /production')).toBe(false);
  });

  it('permits verified safe engineering command', () => {
    const result = RowLevelSecurityPolicyValidator.inspect('git status && npm run test');
    expect(result.isThreat).toBe(false);
    expect(RowLevelSecurityPolicyValidator.validate('git status && npm run test')).toBe(true);
  });
});
