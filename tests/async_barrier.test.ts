import { describe, it, expect } from 'vitest';
import { AsyncBarrier } from '../src/utils/async_barrier.js';

describe('AsyncBarrier', () => {
  it('synchronizes multiple async operations', async () => {
    const barrier = new AsyncBarrier(3);
    const order: number[] = [];

    const worker = async (id: number) => {
      order.push(id);
      await barrier.wait();
      order.push(id + 10);
    };

    await Promise.all([worker(1), worker(2), worker(3)]);
    expect(order.slice(0, 3)).toEqual([1, 2, 3]);
    expect(order.slice(3).sort((a, b) => a - b)).toEqual([11, 12, 13]);
  });
});
