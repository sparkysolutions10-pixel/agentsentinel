import { describe, it, expect } from 'vitest';
import { DurationParser } from '../src/utils/duration_parser.js';

describe('DurationParser', () => {
  it('parses duration strings accurately', () => {
    expect(DurationParser.parseToMs('500ms')).toBe(500);
    expect(DurationParser.parseToMs('10s')).toBe(10000);
    expect(DurationParser.parseToMs('5m')).toBe(300000);
    expect(DurationParser.parseToMs('2h')).toBe(7200000);
    expect(DurationParser.parseToMs('1d')).toBe(86400000);
  });

  it('formats milliseconds to human readable strings', () => {
    expect(DurationParser.format(500)).toBe('500ms');
    expect(DurationParser.format(10000)).toBe('10s');
    expect(DurationParser.format(300000)).toBe('5m');
  });
});
