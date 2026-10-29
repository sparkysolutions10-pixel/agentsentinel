import { describe, it, expect } from 'vitest';
import { SlidingEventQueue } from '../src/queue.js';

describe('SlidingEventQueue - Memory-Bounded Ring Buffer (Issue #16)', () => {
  it('stores items and preserves FIFO chronological ordering', () => {
    const queue = new SlidingEventQueue<string>(5);
    queue.push('a').push('b').push('c');

    expect(queue.size).toBe(3);
    expect(queue.toArray()).toEqual(['a', 'b', 'c']);
    expect(queue.peek()).toBe('c');
    expect(queue.oldest()).toBe('a');
    expect(queue.droppedCount).toBe(0);
  });

  it('drops the oldest items and tracks droppedCount when capacity overflows', () => {
    const queue = new SlidingEventQueue<number>(3);

    queue.push(1);
    queue.push(2);
    queue.push(3);
    expect(queue.size).toBe(3);
    expect(queue.droppedCount).toBe(0);
    expect(queue.toArray()).toEqual([1, 2, 3]);

    // Push 4th item -> drops 1
    queue.push(4);
    expect(queue.size).toBe(3);
    expect(queue.droppedCount).toBe(1);
    expect(queue.toArray()).toEqual([2, 3, 4]);
    expect(queue.oldest()).toBe(2);
    expect(queue.peek()).toBe(4);

    // Push 5th item -> drops 2
    queue.push(5);
    expect(queue.size).toBe(3);
    expect(queue.droppedCount).toBe(2);
    expect(queue.toArray()).toEqual([3, 4, 5]);
    expect(queue.oldest()).toBe(3);
    expect(queue.peek()).toBe(5);
  });

  it('rejects invalid non-positive or non-integer capacities', () => {
    expect(() => new SlidingEventQueue(0)).toThrow(RangeError);
    expect(() => new SlidingEventQueue(-5)).toThrow(RangeError);
    expect(() => new SlidingEventQueue(3.5)).toThrow(RangeError);
  });

  it('clears all items and resets state', () => {
    const queue = new SlidingEventQueue<string>(3);
    queue.push('x').push('y');
    expect(queue.size).toBe(2);

    queue.clear();
    expect(queue.size).toBe(0);
    expect(queue.droppedCount).toBe(0);
    expect(queue.toArray()).toEqual([]);
    expect(queue.peek()).toBeUndefined();
    expect(queue.oldest()).toBeUndefined();
  });
});
