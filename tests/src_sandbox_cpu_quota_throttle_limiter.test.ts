import { describe, it, expect } from 'vitest';
import { CpuQuotaThrottleLimiter } from '../src/sandbox/cpu_quota_throttle_limiter.js';

describe('CpuQuotaThrottleLimiter Invariant Suite (#2058)', () => {
  it('correctly intercepts dangerous pattern', () => {
    const result = CpuQuotaThrottleLimiter.inspect('rm -rf /production');
    expect(result.isThreat).toBe(true);
    expect(result.invariant).toBe('RULE_INVARIANT_CPU_QUOTA_THROTTLE_LIMITER');
    expect(CpuQuotaThrottleLimiter.validate('rm -rf /production')).toBe(false);
  });

  it('permits verified safe engineering command', () => {
    const result = CpuQuotaThrottleLimiter.inspect('git status && npm run test');
    expect(result.isThreat).toBe(false);
    expect(CpuQuotaThrottleLimiter.validate('git status && npm run test')).toBe(true);
  });
});
