import { describe, it, expect } from 'vitest';
import { DriverSignatureEnforcementCheck } from '../src/ast/driver_signature_enforcement_check.js';

describe('DriverSignatureEnforcementCheck Invariant Suite (#1901)', () => {
  it('correctly intercepts dangerous pattern', () => {
    const result = DriverSignatureEnforcementCheck.inspect('rm -rf /production');
    expect(result.isThreat).toBe(true);
    expect(result.invariant).toBe('RULE_INVARIANT_DRIVER_SIGNATURE_ENFORCEMENT_CHECK');
    expect(DriverSignatureEnforcementCheck.validate('rm -rf /production')).toBe(false);
  });

  it('permits verified safe engineering command', () => {
    const result = DriverSignatureEnforcementCheck.inspect('git status && npm run test');
    expect(result.isThreat).toBe(false);
    expect(DriverSignatureEnforcementCheck.validate('git status && npm run test')).toBe(true);
  });
});
