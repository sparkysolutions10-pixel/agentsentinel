import { describe, it, expect } from 'vitest';
import { CronParser } from '../src/utils/cron_parser.js';

describe('CronParser', () => {
  it('validates 5-part cron syntax', () => {
    expect(CronParser.isValid('* * * * *')).toBe(true);
    expect(CronParser.isValid('*/15 * * * *')).toBe(true);
    expect(CronParser.isValid('0 12 1 * 5')).toBe(true);
    expect(CronParser.isValid('* * *')).toBe(false);
    expect(CronParser.isValid('99 * * * *')).toBe(false);
  });

  it('matches dates against cron rules', () => {
    const d = new Date(2026, 9, 31, 12, 0, 0); // Month index 9 = Oct
    expect(CronParser.matches('0 12 * * *', d)).toBe(true);
    expect(CronParser.matches('0 14 * * *', d)).toBe(false);
  });
});
