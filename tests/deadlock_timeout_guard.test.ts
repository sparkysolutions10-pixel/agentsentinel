import { describe, it, expect } from 'vitest';
import { DeadlockTimeoutGuard } from '../src/utils/deadlock_timeout_guard.js';

describe('DeadlockTimeoutGuard', () => {
  it('resolves successfully when promise completes before timeout', async () => {
    const quickPromise = new Promise(r => setTimeout(() => r('done'), 10));
    const result = await DeadlockTimeoutGuard.withTimeout(quickPromise, 50, 'QuickTask');
    expect(result).toBe('done');
  });

  it('rejects with descriptive timeout message when promise hangs', async () => {
    const hungPromise = new Promise(r => setTimeout(r, 100));
    await expect(
      DeadlockTimeoutGuard.withTimeout(hungPromise, 20, 'DbQuery')
    ).rejects.toThrow('DbQuery timed out after 20ms');
  });
});
