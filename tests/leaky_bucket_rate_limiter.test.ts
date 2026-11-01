import { describe, it, expect } from 'vitest';
import { LeakyBucketRateLimiter } from '../src/utils/leaky_bucket_rate_limiter.js';

describe('LeakyBucketRateLimiter', () => {
  it('allows requests up to capacity and blocks overflows', () => {
    const limiter = new LeakyBucketRateLimiter(5, 1);
    expect(limiter.allowRequest(3, 1000)).toBe(true);
    expect(limiter.allowRequest(2, 1000)).toBe(true);
    expect(limiter.allowRequest(1, 1000)).toBe(false);

    // After 2 seconds, 2 units leak
    expect(limiter.allowRequest(1, 3000)).toBe(true);
  });
});
