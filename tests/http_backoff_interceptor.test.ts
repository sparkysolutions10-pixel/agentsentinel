import { describe, it, expect, vi } from 'vitest';
import { HttpExponentialBackoffInterceptor } from '../src/web3/http_backoff_interceptor.js';

describe('HttpExponentialBackoffInterceptor', () => {
  it('calculates full-jitter backoff within bounded range', () => {
    const interceptor = new HttpExponentialBackoffInterceptor({
      baseDelayMs: 100,
      maxDelayMs: 2000
    });

    for (let attempt = 0; attempt < 5; attempt++) {
      const delay = interceptor.calculateJitterDelay(attempt);
      expect(delay).toBeGreaterThanOrEqual(0);
      expect(delay).toBeLessThanOrEqual(2000);
    }
  });

  it('retries on HTTP 429 errors and succeeds when next attempt resolves', async () => {
    const interceptor = new HttpExponentialBackoffInterceptor({
      baseDelayMs: 10,
      maxDelayMs: 50,
      maxRetries: 3
    });

    let calls = 0;
    const fakeRpc = vi.fn().mockImplementation(async () => {
      calls++;
      if (calls === 1) {
        const err: any = new Error('Rate Limited');
        err.status = 429;
        throw err;
      }
      return { result: 'ledger_data' };
    });

    const result = await interceptor.executeWithRetry(fakeRpc);
    expect(result).toEqual({ result: 'ledger_data' });
    expect(calls).toBe(2);
  });
});
