import { describe, it, expect } from 'vitest';
import { SwapfileTamperingInterceptor } from '../src/ast/swapfile_tampering_interceptor.js';

describe('SwapfileTamperingInterceptor Invariant Suite (#1880)', () => {
  it('correctly intercepts dangerous pattern', () => {
    const result = SwapfileTamperingInterceptor.inspect('rm -rf /production');
    expect(result.isThreat).toBe(true);
    expect(result.invariant).toBe('RULE_INVARIANT_SWAPFILE_TAMPERING_INTERCEPTOR');
    expect(SwapfileTamperingInterceptor.validate('rm -rf /production')).toBe(false);
  });

  it('permits verified safe engineering command', () => {
    const result = SwapfileTamperingInterceptor.inspect('git status && npm run test');
    expect(result.isThreat).toBe(false);
    expect(SwapfileTamperingInterceptor.validate('git status && npm run test')).toBe(true);
  });
});
