import { describe, it, expect } from 'vitest';
import { RegexPatternValidator } from '../src/utils/regex_pattern_validator.js';

describe('RegexPatternValidator', () => {
  it('validates standard regex strings', () => {
    expect(RegexPatternValidator.isValidPattern('^[a-z0-9]+$')).toBe(true);
    expect(RegexPatternValidator.isValidPattern('[invalid-regex(')).toBe(false);
  });

  it('detects nested quantifier ReDoS vulnerabilities', () => {
    expect(RegexPatternValidator.isPotentialRedos('(a+)+')).toBe(true);
    expect(RegexPatternValidator.isPotentialRedos('([a-z]*)*')).toBe(true);
    expect(RegexPatternValidator.isPotentialRedos('^[a-z]+$')).toBe(false);
  });
});
