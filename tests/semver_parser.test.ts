import { describe, it, expect } from 'vitest';
import { SemverParser } from '../src/utils/semver_parser.js';

describe('SemverParser', () => {
  it('parses valid semver strings', () => {
    const parsed = SemverParser.parse('v1.2.3-beta.1');
    expect(parsed).toEqual({
      major: 1,
      minor: 2,
      patch: 3,
      prerelease: 'beta.1'
    });
  });

  it('compares versions correctly', () => {
    expect(SemverParser.compare('1.2.3', '1.2.2')).toBe(1);
    expect(SemverParser.compare('1.2.3', '1.2.3')).toBe(0);
    expect(SemverParser.compare('1.2.3', '2.0.0')).toBe(-1);
    expect(SemverParser.compare('1.0.0', '1.0.0-rc1')).toBe(1);
  });

  it('evaluates minimum version satisfaction', () => {
    expect(SemverParser.satisfies('1.5.0', '1.2.0')).toBe(true);
    expect(SemverParser.satisfies('1.1.0', '1.2.0')).toBe(false);
  });
});
