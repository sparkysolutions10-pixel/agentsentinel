import { describe, it, expect } from 'vitest';
import { PromiseTimeoutWrapper } from '../src/utils/promise_timeout_wrapper.js';

describe('PromiseTimeoutWrapper', () => {
  it('resolves fast promise successfully', async () => {
    const res = await PromiseTimeoutWrapper.withTimeout(Promise.resolve('ok'), 100);
    expect(res).toBe('ok');
  });

  it('rejects with timeout error when promise exceeds limit', async () => {
    const slow = new Promise(r => setTimeout(r, 100));
    await expect(PromiseTimeoutWrapper.withTimeout(slow, 20)).rejects.toThrow('Operation timed out');
  });
});
