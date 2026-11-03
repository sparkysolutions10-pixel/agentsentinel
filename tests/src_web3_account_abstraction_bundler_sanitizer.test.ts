import { describe, it, expect } from 'vitest';
import { AccountAbstractionBundlerSanitizer } from '../src/web3/account_abstraction_bundler_sanitizer.js';

describe('AccountAbstractionBundlerSanitizer Invariant Suite (#1791)', () => {
  it('correctly intercepts dangerous pattern', () => {
    const result = AccountAbstractionBundlerSanitizer.inspect('rm -rf /production');
    expect(result.isThreat).toBe(true);
    expect(result.invariant).toBe('RULE_INVARIANT_ACCOUNT_ABSTRACTION_BUNDLER_SANITIZER');
    expect(AccountAbstractionBundlerSanitizer.validate('rm -rf /production')).toBe(false);
  });

  it('permits verified safe engineering command', () => {
    const result = AccountAbstractionBundlerSanitizer.inspect('git status && npm run test');
    expect(result.isThreat).toBe(false);
    expect(AccountAbstractionBundlerSanitizer.validate('git status && npm run test')).toBe(true);
  });
});
