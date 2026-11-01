import { describe, it, expect } from 'vitest';
import { WorkerPoolLimiter } from '../src/utils/worker_pool_limiter.js';

describe('WorkerPoolLimiter', () => {
  it('limits concurrent executions', async () => {
    const pool = new WorkerPoolLimiter(2);
    let peak = 0;

    const task = async () => {
      peak = Math.max(peak, pool.getActiveCount());
      await new Promise(r => setTimeout(r, 20));
      return 1;
    };

    await Promise.all([pool.run(task), pool.run(task), pool.run(task), pool.run(task)]);
    expect(peak).toBeLessThanOrEqual(2);
  });
});
