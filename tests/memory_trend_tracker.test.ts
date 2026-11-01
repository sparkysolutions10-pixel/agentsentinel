import { describe, it, expect } from 'vitest';
import { MemoryTrendTracker } from '../src/utils/memory_trend_tracker.js';

describe('MemoryTrendTracker', () => {
  it('computes heap growth rate per second', () => {
    const tracker = new MemoryTrendTracker();
    tracker.addSample(1000, 1000);
    tracker.addSample(2000, 2000);
    expect(tracker.getGrowthRatePerSec()).toBe(1000);
  });
});
