import { describe, it, expect } from 'vitest';
import { RollingThroughputMeter } from '../src/utils/rolling_throughput_meter.js';

describe('RollingThroughputMeter', () => {
  it('calculates rate per second across window accurately', () => {
    const meter = new RollingThroughputMeter(10000, 1000); // 10s window
    const baseTime = 100000;

    meter.mark(100, baseTime);
    expect(meter.getWindowCount(baseTime)).toBe(100);
    expect(meter.getRatePerSecond(baseTime)).toBe(10); // 100 events / 10 seconds = 10 eps
  });

  it('prunes expired buckets past the rolling window', () => {
    const meter = new RollingThroughputMeter(5000, 1000); // 5s window
    const baseTime = 100000;

    meter.mark(50, baseTime);
    meter.mark(50, baseTime + 2000);

    expect(meter.getWindowCount(baseTime + 2000)).toBe(100);

    // After 6 seconds from baseTime, the first bucket expires
    expect(meter.getWindowCount(baseTime + 6000)).toBe(50);
    // After 8 seconds, all initial buckets expire
    expect(meter.getWindowCount(baseTime + 8000)).toBe(0);
  });

  it('maintains total lifetime count regardless of window pruning', () => {
    const meter = new RollingThroughputMeter(2000, 500);
    meter.mark(10, 1000);
    meter.mark(20, 5000);

    expect(meter.getWindowCount(5000)).toBe(20);
    expect(meter.getTotalCount()).toBe(30);
  });
});
