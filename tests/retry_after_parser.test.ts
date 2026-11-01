import { describe, it, expect } from 'vitest';
import { RetryAfterParser } from '../src/utils/retry_after_parser.js';

describe('RetryAfterParser', () => {
  it('parses integer seconds into milliseconds', () => {
    expect(RetryAfterParser.parseToMs('60')).toBe(60000);
  });

  it('parses HTTP date string into delta milliseconds', () => {
    const targetDate = new Date(1700000060000).toUTCString();
    expect(RetryAfterParser.parseToMs(targetDate, 1700000000000)).toBe(60000);
  });
});
