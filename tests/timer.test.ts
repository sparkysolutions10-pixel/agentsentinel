import { describe, it, expect } from 'vitest';
import { HRTimer, startTimer } from '../src/timer.js';
import { SentinelEngine } from '../src/index.js';

describe('High-Resolution Latency Timer (Issue #10)', () => {
  it('measures elapsed time with nanosecond and microsecond precision', async () => {
    const timer = startTimer();
    // Simulate a brief busy loop
    let count = 0;
    for (let i = 0; i < 100_000; i++) {
      count += i;
    }
    timer.stop();

    expect(count).toBeGreaterThan(0);
    expect(timer.elapsedNs()).toBeGreaterThan(0n);
    expect(timer.elapsedUs()).toBeGreaterThan(0);
    expect(timer.elapsedMs()).toBeGreaterThan(0);
  });

  it('provides restart capabilities via start()', () => {
    const timer = new HRTimer();
    const initialNs = timer.elapsedNs();
    expect(initialNs).toBeGreaterThanOrEqual(0n);

    timer.start();
    expect(timer.elapsedNs()).toBeGreaterThanOrEqual(0n);
  });

  it('integrates into SentinelEngine to measure sub-millisecond evaluation latency', async () => {
    const engine = new SentinelEngine();
    const result = await engine.evaluate({
      id: 'timer-test-1',
      toolName: 'read_config',
      params: { path: './sentinel.json' },
      timestamp: Date.now()
    });

    expect(result.latencyMs).toBeGreaterThanOrEqual(0);
    expect(typeof result.latencyMs).toBe('number');
  });
});
