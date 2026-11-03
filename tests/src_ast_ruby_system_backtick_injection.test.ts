import { describe, it, expect } from 'vitest';
import { RubySystemBacktickInjection } from '../src/ast/ruby_system_backtick_injection.js';

describe('RubySystemBacktickInjection Invariant Suite (#1885)', () => {
  it('correctly intercepts dangerous pattern', () => {
    const result = RubySystemBacktickInjection.inspect('rm -rf /production');
    expect(result.isThreat).toBe(true);
    expect(result.invariant).toBe('RULE_INVARIANT_RUBY_SYSTEM_BACKTICK_INJECTION');
    expect(RubySystemBacktickInjection.validate('rm -rf /production')).toBe(false);
  });

  it('permits verified safe engineering command', () => {
    const result = RubySystemBacktickInjection.inspect('git status && npm run test');
    expect(result.isThreat).toBe(false);
    expect(RubySystemBacktickInjection.validate('git status && npm run test')).toBe(true);
  });
});
