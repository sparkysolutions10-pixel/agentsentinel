import { describe, it, expect } from 'vitest';
import { SlidingEventQueue } from '../src/queue.js';
import { AuditEvent } from '../src/logger.js';
import { Verdict } from '../src/types.js';

describe('SlidingEventQueue - Boundary Conditions & Memory Stability (Issue #17)', () => {
  it('maintains bounded memory (< 10MB heap delta) when flooded with 100,000 events', () => {
    // Force GC if available or record baseline memory
    if (global.gc) {
      global.gc();
    }
    const initialMemory = process.memoryUsage().heapUsed;

    const queueCapacity = 1000;
    const queue = new SlidingEventQueue<AuditEvent>(queueCapacity);
    const TOTAL_EVENTS = 100_000;

    for (let i = 0; i < TOTAL_EVENTS; i++) {
      const event: AuditEvent = {
        eventId: `evt-${i}`,
        timestamp: '2026-10-29T09:00:00.000Z',
        toolName: 'shell:execute',
        toolCategory: 'shell',
        verdict: Verdict.BLOCK,
        ruleId: 'no-destructive-bash',
        durationMs: 0.05,
        riskScore: 90,
      };
      queue.push(event);
    }

    if (global.gc) {
      global.gc();
    }
    const finalMemory = process.memoryUsage().heapUsed;
    const heapDeltaMB = (finalMemory - initialMemory) / (1024 * 1024);

    // Assert strictly bounded size
    expect(queue.size).toBe(queueCapacity);
    expect(queue.droppedCount).toBe(TOTAL_EVENTS - queueCapacity);

    // Verify boundary elements
    const oldest = queue.oldest();
    const newest = queue.peek();
    expect(oldest?.eventId).toBe(`evt-${TOTAL_EVENTS - queueCapacity}`);
    expect(newest?.eventId).toBe(`evt-${TOTAL_EVENTS - 1}`);

    // Verify heap delta is comfortably under 10MB
    // Under Node.js V8, 1,000 objects in a preallocated array takes < 1.5MB
    expect(heapDeltaMB).toBeLessThan(10);
  });

  it('handles boundary condition of capacity = 1 with extreme churn', () => {
    const queue = new SlidingEventQueue<number>(1);
    expect(queue.size).toBe(0);
    expect(queue.peek()).toBeUndefined();
    expect(queue.oldest()).toBeUndefined();

    for (let i = 0; i < 50_000; i++) {
      queue.push(i);
    }

    expect(queue.size).toBe(1);
    expect(queue.peek()).toBe(49_999);
    expect(queue.oldest()).toBe(49_999);
    expect(queue.droppedCount).toBe(49_999);
    expect(queue.toArray()).toEqual([49_999]);
  });

  it('preserves accurate chronological ordering and indexing after multiple buffer wrap-arounds', () => {
    const capacity = 4;
    const queue = new SlidingEventQueue<number>(capacity);

    // 1st wrap
    for (let i = 1; i <= 10; i++) {
      queue.push(i);
    }
    expect(queue.toArray()).toEqual([7, 8, 9, 10]);
    expect(queue.oldest()).toBe(7);
    expect(queue.peek()).toBe(10);
    expect(queue.droppedCount).toBe(6);

    // 2nd wrap
    for (let i = 11; i <= 15; i++) {
      queue.push(i);
    }
    expect(queue.toArray()).toEqual([12, 13, 14, 15]);
    expect(queue.oldest()).toBe(12);
    expect(queue.peek()).toBe(15);
    expect(queue.droppedCount).toBe(11);
  });

  it('handles repeated clearing and refilling without memory leakage or index corruption', () => {
    const queue = new SlidingEventQueue<string>(100);

    for (let cycle = 0; cycle < 50; cycle++) {
      for (let i = 0; i < 200; i++) {
        queue.push(`cycle-${cycle}-item-${i}`);
      }
      expect(queue.size).toBe(100);
      expect(queue.droppedCount).toBe(100);
      queue.clear();
      expect(queue.size).toBe(0);
      expect(queue.droppedCount).toBe(0);
      expect(queue.toArray()).toEqual([]);
    }
  });
});
