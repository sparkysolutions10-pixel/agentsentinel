import { describe, it, expect } from 'vitest';
import { ObjectDepthLimiter } from '../src/utils/object_depth_limiter.js';

describe('ObjectDepthLimiter', () => {
  it('calculates nesting depth accurately', () => {
    expect(ObjectDepthLimiter.calculateDepth('scalar')).toBe(1);
    expect(ObjectDepthLimiter.calculateDepth({ a: 1 })).toBe(1);
    expect(ObjectDepthLimiter.calculateDepth({ a: { b: 2 } })).toBe(2);
    expect(ObjectDepthLimiter.calculateDepth({ a: { b: { c: { d: 4 } } } })).toBe(4);
  });

  it('validates against max depth constraints', () => {
    const deepObj = { a: { b: { c: { d: { e: { f: 6 } } } } } };
    expect(ObjectDepthLimiter.isWithinMaxDepth(deepObj, 5)).toBe(false);
    expect(ObjectDepthLimiter.isWithinMaxDepth(deepObj, 10)).toBe(true);
  });
});
