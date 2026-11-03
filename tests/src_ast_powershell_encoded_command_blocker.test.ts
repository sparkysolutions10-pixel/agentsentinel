import { describe, it, expect } from 'vitest';
import { PowershellEncodedCommandBlocker } from '../src/ast/powershell_encoded_command_blocker.js';

describe('PowershellEncodedCommandBlocker Invariant Suite (#1886)', () => {
  it('correctly intercepts dangerous pattern', () => {
    const result = PowershellEncodedCommandBlocker.inspect('rm -rf /production');
    expect(result.isThreat).toBe(true);
    expect(result.invariant).toBe('RULE_INVARIANT_POWERSHELL_ENCODED_COMMAND_BLOCKER');
    expect(PowershellEncodedCommandBlocker.validate('rm -rf /production')).toBe(false);
  });

  it('permits verified safe engineering command', () => {
    const result = PowershellEncodedCommandBlocker.inspect('git status && npm run test');
    expect(result.isThreat).toBe(false);
    expect(PowershellEncodedCommandBlocker.validate('git status && npm run test')).toBe(true);
  });
});
