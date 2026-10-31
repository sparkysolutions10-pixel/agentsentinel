import { describe, it, expect } from 'vitest';
import { MemoryUsageSampler } from '../src/utils/memory_usage_sampler.js';

describe('MemoryUsageSampler', () => {
  it('samples memory and sets initial baseline', () => {
    const sampler = new MemoryUsageSampler();
    const s1 = sampler.sample({
      heapUsed: 10 * 1024 * 1024,
      heapTotal: 20 * 1024 * 1024,
      rss: 30 * 1024 * 1024,
      external: 0,
      arrayBuffers: 0
    }, 1000);

    expect(sampler.getBaseline()).toEqual(s1);
    expect(sampler.getLatest()).toEqual(s1);
  });

  it('computes memory deltas accurately across samples', () => {
    const sampler = new MemoryUsageSampler();
    sampler.sample({
      heapUsed: 10 * 1024 * 1024,
      heapTotal: 20 * 1024 * 1024,
      rss: 30 * 1024 * 1024,
      external: 0,
      arrayBuffers: 0
    }, 1000);

    sampler.sample({
      heapUsed: 14 * 1024 * 1024,
      heapTotal: 20 * 1024 * 1024,
      rss: 35 * 1024 * 1024,
      external: 0,
      arrayBuffers: 0
    }, 3000);

    const delta = sampler.getDeltaFromBaseline();
    expect(delta?.heapUsedDeltaBytes).toBe(4 * 1024 * 1024);
    expect(delta?.rssDeltaBytes).toBe(5 * 1024 * 1024);
    expect(delta?.elapsedMs).toBe(2000);
  });

  it('validates memory limits', () => {
    const sampler = new MemoryUsageSampler();
    sampler.sample({
      heapUsed: 10,
      heapTotal: 20,
      rss: 50 * 1024 * 1024,
      external: 0,
      arrayBuffers: 0
    });

    expect(sampler.isWithinLimit(100 * 1024 * 1024)).toBe(true);
    expect(sampler.isWithinLimit(25 * 1024 * 1024)).toBe(false);
  });

  it('formats bytes human-readably', () => {
    expect(MemoryUsageSampler.formatBytes(500)).toBe('500 B');
    expect(MemoryUsageSampler.formatBytes(2048)).toBe('2.00 KB');
    expect(MemoryUsageSampler.formatBytes(15 * 1024 * 1024)).toBe('15.00 MB');
    expect(MemoryUsageSampler.formatBytes(2 * 1024 * 1024 * 1024)).toBe('2.00 GB');
  });
});
