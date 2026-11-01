import { describe, it, expect } from 'vitest';
import { SlidingWindowCounter } from '../src/utils/sliding_window_counter.js';

describe('SlidingWindowCounter', () => {
  it('counts events within window', () => {
    const counter = new SlidingWindowCounter(1000);
    counter.increment(2, 500);
    counter.increment(1, 800);
    expect(counter.getCount(900)).toBe(3);
    expect(counter.getCount(1600)).toBe(1); // 500 expired
  });
});
