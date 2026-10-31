import { describe, it, expect } from 'vitest';
import { ByteSizeFormatter } from '../src/utils/byte_size_formatter.js';

describe('ByteSizeFormatter', () => {
  it('formats byte numbers into human readable units', () => {
    expect(ByteSizeFormatter.format(0)).toBe('0 B');
    expect(ByteSizeFormatter.format(1024)).toBe('1 KB');
    expect(ByteSizeFormatter.format(1048576)).toBe('1 MB');
    expect(ByteSizeFormatter.format(1073741824)).toBe('1 GB');
  });

  it('parses human scale strings into byte counts', () => {
    expect(ByteSizeFormatter.parse('1 KB')).toBe(1024);
    expect(ByteSizeFormatter.parse('2.5 MB')).toBe(2621440);
  });
});
