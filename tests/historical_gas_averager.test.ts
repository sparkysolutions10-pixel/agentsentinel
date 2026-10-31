import { describe, it, expect } from 'vitest';
import { HistoricalGasSpikeAverager } from '../src/web3/historical_gas_averager.js';

describe('HistoricalGasSpikeAverager', () => {
  it('computes rolling mean accurately', () => {
    const averager = new HistoricalGasSpikeAverager(5);
    [100, 100, 100, 100, 100].forEach(f => averager.addSample(f));
    expect(averager.getMean()).toBe(100);
    expect(averager.getStandardDeviation()).toBe(0);
  });

  it('detects 2-sigma fee anomaly spike accurately', () => {
    const averager = new HistoricalGasSpikeAverager(10);
    [100, 102, 98, 101, 99, 100, 101, 99, 100, 100].forEach(f => averager.addSample(f));

    expect(averager.isAnomaly(101)).toBe(false);
    expect(averager.isAnomaly(1000)).toBe(true); // extreme spike
  });
});
