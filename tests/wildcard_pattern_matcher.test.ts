import { describe, it, expect } from 'vitest';
import { WildcardPatternMatcher } from '../src/utils/wildcard_pattern_matcher.js';

describe('WildcardPatternMatcher', () => {
  it('matches simple wildcards', () => {
    expect(WildcardPatternMatcher.matches('*.stellar.org', 'horizon.stellar.org')).toBe(true);
    expect(WildcardPatternMatcher.matches('*.stellar.org', 'testnet.stellar.org')).toBe(true);
    expect(WildcardPatternMatcher.matches('*.stellar.org', 'evil.com')).toBe(false);
  });

  it('matches single-character wildcards (?)', () => {
    expect(WildcardPatternMatcher.matches('node-??', 'node-01')).toBe(true);
    expect(WildcardPatternMatcher.matches('node-??', 'node-1')).toBe(false);
  });

  it('supports list matches', () => {
    const list = ['*.local', '192.168.*', 'api.prod.org'];
    expect(WildcardPatternMatcher.isAnyMatch(list, 'dev.local')).toBe(true);
    expect(WildcardPatternMatcher.isAnyMatch(list, '192.168.1.10')).toBe(true);
    expect(WildcardPatternMatcher.isAnyMatch(list, 'evil.io')).toBe(false);
  });
});
