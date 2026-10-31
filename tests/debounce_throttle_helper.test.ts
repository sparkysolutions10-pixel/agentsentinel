import { describe, it, expect, vi } from 'vitest';
import { DebounceThrottleHelper } from '../src/utils/debounce_throttle_helper.js';

describe('DebounceThrottleHelper', () => {
  it('debounces multiple calls until delay passes', async () => {
    const fn = vi.fn();
    const debounced = DebounceThrottleHelper.debounce(fn, 50);

    debounced('a');
    debounced('b');
    debounced('c');

    expect(fn).not.toHaveBeenCalled();
    await new Promise(r => setTimeout(r, 70));
    expect(fn).toHaveBeenCalledTimes(1);
    expect(fn).toHaveBeenCalledWith('c');
  });

  it('cancels pending debounce', async () => {
    const fn = vi.fn();
    const debounced = DebounceThrottleHelper.debounce(fn, 50);

    debounced('test');
    debounced.cancel();

    await new Promise(r => setTimeout(r, 70));
    expect(fn).not.toHaveBeenCalled();
  });
});
