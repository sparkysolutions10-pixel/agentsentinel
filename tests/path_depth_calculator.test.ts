import { describe, it, expect } from 'vitest';
import { PathDepthCalculator } from '../src/utils/path_depth_calculator.js';

describe('PathDepthCalculator', () => {
  it('calculates depth accurately across platforms', () => {
    expect(PathDepthCalculator.calculateDepth('file.txt')).toBe(1);
    expect(PathDepthCalculator.calculateDepth('src/utils/math.ts')).toBe(3);
    expect(PathDepthCalculator.calculateDepth('/var/log/app/errors.log')).toBe(4);
  });

  it('enforces maximum depth constraints', () => {
    const deepPath = 'a/b/c/d/e/f/g.txt';
    expect(PathDepthCalculator.isWithinMaxDepth(deepPath, 10)).toBe(true);
    expect(PathDepthCalculator.isWithinMaxDepth(deepPath, 5)).toBe(false);
  });
});
