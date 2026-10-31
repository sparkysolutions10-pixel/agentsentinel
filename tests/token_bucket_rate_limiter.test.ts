import { describe, it, expect } from 'vitest';
import { TokenBucketRateLimiter } from '../src/utils/token_bucket_rate_limiter.js';

describe('TokenBucketRateLimiter', () => {
  it('allows consumption up to capacity and denies excess', () => {
    const limiter = new TokenBucketRateLimiter(5, 1, 5, 1000);

    expect(limiter.tryConsume(3, 1000)).toBe(true);
    expect(limiter.tryConsume(2, 1000)).toBe(true);
    expect(limiter.tryConsume(1, 1000)).toBe(false); // empty
  });

  it('refills tokens over elapsed time', () => {
    const limiter = new TokenBucketRateLimiter(5, 2, 0, 1000); // 2 tokens/sec, starts empty

    expect(limiter.tryConsume(1, 1000)).toBe(false);
    // After 1.5 seconds, 3 tokens refilled
    expect(limiter.tryConsume(3, 2500)).toBe(true);
  });
});
