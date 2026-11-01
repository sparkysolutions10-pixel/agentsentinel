import { describe, it, expect } from 'vitest';
import { ExecutionTimeTracker } from '../src/utils/execution_time_tracker.js';

describe('ExecutionTimeTracker', () => {
  it('tracks elapsed milliseconds', async () => {
    const tracker = new ExecutionTimeTracker();
    tracker.start();
    await new Promise(r => setTimeout(r, 20));
    const elapsed = tracker.stop();
    expect(elapsed).toBeGreaterThan(0);
  });
});
