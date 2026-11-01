import { describe, it, expect } from 'vitest';
import { RecursiveBracketDepthGuard } from '../src/utils/recursive_bracket_depth_guard.js';

describe('RecursiveBracketDepthGuard', () => {
  it('calculates bracket nesting depth', () => {
    expect(RecursiveBracketDepthGuard.getMaxDepth('(((1 + 2) * 3))')).toBe(3);
    expect(RecursiveBracketDepthGuard.isSafe('('.repeat(25) + ')'.repeat(25), 20)).toBe(false);
    expect(RecursiveBracketDepthGuard.isSafe('normal text', 20)).toBe(true);
  });
});
