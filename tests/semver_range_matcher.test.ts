import { describe, it, expect } from 'vitest';
import { SemverRangeMatcher } from '../src/utils/semver_range_matcher.js';

describe('SemverRangeMatcher', () => {
  it('satisfies exact version comparisons', () => {
    expect(SemverRangeMatcher.satisfies('1.2.3', '1.2.3')).toBe(true);
    expect(SemverRangeMatcher.satisfies('1.2.3', '1.2.4')).toBe(false);
  });

  it('satisfies caret (^) ranges', () => {
    expect(SemverRangeMatcher.satisfies('1.2.4', '^1.2.0')).toBe(true);
    expect(SemverRangeMatcher.satisfies('1.5.0', '^1.2.0')).toBe(true);
    expect(SemverRangeMatcher.satisfies('2.0.0', '^1.2.0')).toBe(false);
  });

  it('satisfies tilde (~) ranges', () => {
    expect(SemverRangeMatcher.satisfies('1.2.5', '~1.2.0')).toBe(true);
    expect(SemverRangeMatcher.satisfies('1.3.0', '~1.2.0')).toBe(false);
  });

  it('satisfies inequality operators', () => {
    expect(SemverRangeMatcher.satisfies('2.1.0', '>=2.0.0')).toBe(true);
    expect(SemverRangeMatcher.satisfies('1.9.9', '>=2.0.0')).toBe(false);
    expect(SemverRangeMatcher.satisfies('0.9.0', '<1.0.0')).toBe(true);
  });
});
