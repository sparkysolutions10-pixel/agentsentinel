import { describe, it, expect } from 'vitest';
import { SlidingWindowLogRateLimiter } from '../src/utils/sliding_window_log_rate_limiter.js';

describe('SlidingWindowLogRateLimiter', () => {
  it('enforces limit per key and permits within window', () => {
    const limiter = new SlidingWindowLogRateLimiter(2, 1000);
    const now = 10000;

    expect(limiter.isAllowed('ip_1', now)).toBe(true);
    expect(limiter.isAllowed('ip_1', now + 100)).toBe(true);
    expect(limiter.isAllowed('ip_1', now + 200)).toBe(false); // 3rd request denied

    // Different key is allowed
    expect(limiter.isAllowed('ip_2', now)).toBe(true);

    // After window expires (1000ms), first requests expire
    expect(limiter.isAllowed('ip_1', now + 1100)).toBe(true);
  });
});
