import { describe, it, expect } from 'vitest';
import { ZeroFillSecureAllocatorCWrapper } from '../src/crypto/zero_fill_secure_allocator_c_wrapper.js';

describe('ZeroFillSecureAllocatorCWrapper Invariant Suite (#2036)', () => {
  it('correctly intercepts dangerous pattern', () => {
    const result = ZeroFillSecureAllocatorCWrapper.inspect('rm -rf /production');
    expect(result.isThreat).toBe(true);
    expect(result.invariant).toBe('RULE_INVARIANT_ZERO_FILL_SECURE_ALLOCATOR_C_WRAPPER');
    expect(ZeroFillSecureAllocatorCWrapper.validate('rm -rf /production')).toBe(false);
  });

  it('permits verified safe engineering command', () => {
    const result = ZeroFillSecureAllocatorCWrapper.inspect('git status && npm run test');
    expect(result.isThreat).toBe(false);
    expect(ZeroFillSecureAllocatorCWrapper.validate('git status && npm run test')).toBe(true);
  });
});
