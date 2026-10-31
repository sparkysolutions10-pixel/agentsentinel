import { describe, it, expect } from 'vitest';
import { AsyncRetryWrapper } from '../src/utils/async_retry_wrapper.js';

describe('AsyncRetryWrapper', () => {
  it('succeeds immediately on first try', async () => {
    const res = await AsyncRetryWrapper.execute(async () => 42, { maxRetries: 3 });
    expect(res).toBe(42);
  });

  it('retries until success within maxRetries limit', async () => {
    let attempts = 0;
    const res = await AsyncRetryWrapper.execute(async (currAttempt) => {
      attempts++;
      if (currAttempt < 2) throw new Error('Temporary failure');
      return 'recovered';
    }, { maxRetries: 3, delayMs: 1 });

    expect(res).toBe('recovered');
    expect(attempts).toBe(3);
  });

  it('stops retry if isRetryable predicate returns false', async () => {
    let attempts = 0;
    await expect(
      AsyncRetryWrapper.execute(async () => {
        attempts++;
        throw new Error('Fatal error');
      }, {
        maxRetries: 3,
        isRetryable: (err) => !err.message.includes('Fatal')
      })
    ).rejects.toThrow('Fatal error');

    expect(attempts).toBe(1);
  });
});
