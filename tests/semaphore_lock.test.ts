import { describe, it, expect } from 'vitest';
import { SemaphoreLock } from '../src/utils/semaphore_lock.js';

describe('SemaphoreLock', () => {
  it('bounds concurrent executions to maxConcurrency', async () => {
    const sem = new SemaphoreLock(2);
    let active = 0;
    let peakActive = 0;

    const task = async () => {
      await sem.acquire();
      active++;
      peakActive = Math.max(peakActive, active);
      await new Promise(r => setTimeout(r, 20));
      active--;
      sem.release();
    };

    await Promise.all([task(), task(), task(), task()]);
    expect(peakActive).toBe(2);
    expect(sem.getActiveCount()).toBe(0);
  });

  it('runs tasks safely with withLock wrapper', async () => {
    const sem = new SemaphoreLock(1);
    const result = await sem.withLock(async () => 'success');
    expect(result).toBe('success');
  });
});
