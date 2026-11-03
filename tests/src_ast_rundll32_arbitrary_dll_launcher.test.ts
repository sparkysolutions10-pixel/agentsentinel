import { describe, it, expect } from 'vitest';
import { Rundll32ArbitraryDllLauncher } from '../src/ast/rundll32_arbitrary_dll_launcher.js';

describe('Rundll32ArbitraryDllLauncher Invariant Suite (#1891)', () => {
  it('correctly intercepts dangerous pattern', () => {
    const result = Rundll32ArbitraryDllLauncher.inspect('rm -rf /production');
    expect(result.isThreat).toBe(true);
    expect(result.invariant).toBe('RULE_INVARIANT_RUNDLL32_ARBITRARY_DLL_LAUNCHER');
    expect(Rundll32ArbitraryDllLauncher.validate('rm -rf /production')).toBe(false);
  });

  it('permits verified safe engineering command', () => {
    const result = Rundll32ArbitraryDllLauncher.inspect('git status && npm run test');
    expect(result.isThreat).toBe(false);
    expect(Rundll32ArbitraryDllLauncher.validate('git status && npm run test')).toBe(true);
  });
});
