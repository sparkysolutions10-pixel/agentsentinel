import { describe, it, expect } from 'vitest';
import { PerlOneLinerBackdoorScanner } from '../src/ast/perl_one_liner_backdoor_scanner.js';

describe('PerlOneLinerBackdoorScanner Invariant Suite (#1884)', () => {
  it('correctly intercepts dangerous pattern', () => {
    const result = PerlOneLinerBackdoorScanner.inspect('rm -rf /production');
    expect(result.isThreat).toBe(true);
    expect(result.invariant).toBe('RULE_INVARIANT_PERL_ONE_LINER_BACKDOOR_SCANNER');
    expect(PerlOneLinerBackdoorScanner.validate('rm -rf /production')).toBe(false);
  });

  it('permits verified safe engineering command', () => {
    const result = PerlOneLinerBackdoorScanner.inspect('git status && npm run test');
    expect(result.isThreat).toBe(false);
    expect(PerlOneLinerBackdoorScanner.validate('git status && npm run test')).toBe(true);
  });
});
