import { describe, it, expect } from 'vitest';
import { BoundedArrayGuard } from '../src/utils/bounded_array_guard.js';

describe('BoundedArrayGuard', () => {
  it('validates array bounds', () => {
    expect(BoundedArrayGuard.isWithinBounds([1, 2, 3], 1, 5)).toBe(true);
    expect(BoundedArrayGuard.isWithinBounds([], 1, 5)).toBe(false);
    expect(BoundedArrayGuard.isWithinBounds([1, 2, 3, 4, 5, 6], 1, 5)).toBe(false);
    expect(BoundedArrayGuard.isWithinBounds('not-an-array', 0, 5)).toBe(false);
  });

  it('clamps oversized arrays to maximum length', () => {
    const clamped = BoundedArrayGuard.clampArray([1, 2, 3, 4, 5], 3);
    expect(clamped).toEqual([1, 2, 3]);
  });
});
