import { describe, it, expect } from 'vitest';
import { CountDownLatch } from '../src/utils/countdown_latch.js';

describe('CountDownLatch', () => {
  it('waits until count reaches zero', async () => {
    const latch = new CountDownLatch(2);
    let done = false;

    latch.wait().then(() => {
      done = true;
    });

    expect(done).toBe(false);
    latch.countDown();
    expect(done).toBe(false);
    latch.countDown();
    await latch.wait();
    expect(done).toBe(true);
  });
});
