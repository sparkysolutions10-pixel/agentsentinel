import { describe, it, expect } from 'vitest';
import { GracefulShutdownCoordinator } from '../src/utils/graceful_shutdown_coordinator.js';

describe('GracefulShutdownCoordinator', () => {
  it('runs teardown hooks in reverse order', async () => {
    const coord = new GracefulShutdownCoordinator();
    const calls: number[] = [];
    coord.register(() => { calls.push(1); });
    coord.register(() => { calls.push(2); });
    await coord.shutdown();
    expect(calls).toEqual([2, 1]);
  });
});
