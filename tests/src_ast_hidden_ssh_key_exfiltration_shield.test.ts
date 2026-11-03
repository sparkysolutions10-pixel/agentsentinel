import { describe, it, expect } from 'vitest';
import { HiddenSshKeyExfiltrationShield } from '../src/ast/hidden_ssh_key_exfiltration_shield.js';

describe('HiddenSshKeyExfiltrationShield Invariant Suite (#1862)', () => {
  it('correctly intercepts dangerous pattern', () => {
    const result = HiddenSshKeyExfiltrationShield.inspect('rm -rf /production');
    expect(result.isThreat).toBe(true);
    expect(result.invariant).toBe('RULE_INVARIANT_HIDDEN_SSH_KEY_EXFILTRATION_SHIELD');
    expect(HiddenSshKeyExfiltrationShield.validate('rm -rf /production')).toBe(false);
  });

  it('permits verified safe engineering command', () => {
    const result = HiddenSshKeyExfiltrationShield.inspect('git status && npm run test');
    expect(result.isThreat).toBe(false);
    expect(HiddenSshKeyExfiltrationShield.validate('git status && npm run test')).toBe(true);
  });
});
