import { describe, it, expect } from 'vitest';
import { SystemLoadAverager } from '../src/utils/system_load_averager.js';

describe('SystemLoadAverager', () => {
  it('initializes to initial sample immediately', () => {
    const averager = new SystemLoadAverager();
    averager.recordLoad(50, 1000);
    expect(averager.getLoadAverages()).toEqual({
      load1m: 50,
      load5m: 50,
      load15m: 50
    });
  });

  it('updates load averages with decay over time', () => {
    const averager = new SystemLoadAverager();
    averager.recordLoad(100, 1000);
    // After 60 seconds of 0 load, 1m load decays
    averager.recordLoad(0, 61000);

    const averages = averager.getLoadAverages();
    expect(averages.load1m).toBeLessThan(40);
    expect(averages.load5m).toBeGreaterThan(averages.load1m);
  });

  it('advises load shedding when 1m load exceeds threshold ratio', () => {
    const averager = new SystemLoadAverager();
    averager.recordLoad(95, 1000);

    // Capacity 100, threshold 0.9 (90)
    expect(averager.shouldShedLoad(100, 0.9)).toBe(true);
    expect(averager.shouldShedLoad(120, 0.9)).toBe(false);
  });
});
