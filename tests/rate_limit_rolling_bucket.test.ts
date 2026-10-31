import { describe, it, expect } from 'vitest';
import { RateLimitRollingBucket } from '../src/web3/rate_limit_rolling_bucket.js';

describe('RateLimitRollingBucket', () => {
  it('allows consuming tokens up to capacity', () => {
    const bucket = new RateLimitRollingBucket({ capacity: 3, refillRatePerSec: 1 });
    const now = Date.now();

    expect(bucket.tryConsume(1, now)).toBe(true);
    expect(bucket.tryConsume(1, now)).toBe(true);
    expect(bucket.tryConsume(1, now)).toBe(true);
    // Bucket is now empty
    expect(bucket.tryConsume(1, now)).toBe(false);
  });

  it('refills tokens over time according to refill rate', () => {
    const bucket = new RateLimitRollingBucket({ capacity: 2, refillRatePerSec: 2 });
    const now = Date.now();

    bucket.tryConsume(2, now);
    expect(bucket.tryConsume(1, now)).toBe(false);

    // After 1 second, 2 tokens refilled
    expect(bucket.tryConsume(1, now + 1000)).toBe(true);
  });
});
