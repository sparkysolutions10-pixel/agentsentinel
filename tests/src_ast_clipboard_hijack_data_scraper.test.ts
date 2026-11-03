import { describe, it, expect } from 'vitest';
import { ClipboardHijackDataScraper } from '../src/ast/clipboard_hijack_data_scraper.js';

describe('ClipboardHijackDataScraper Invariant Suite (#1894)', () => {
  it('correctly intercepts dangerous pattern', () => {
    const result = ClipboardHijackDataScraper.inspect('rm -rf /production');
    expect(result.isThreat).toBe(true);
    expect(result.invariant).toBe('RULE_INVARIANT_CLIPBOARD_HIJACK_DATA_SCRAPER');
    expect(ClipboardHijackDataScraper.validate('rm -rf /production')).toBe(false);
  });

  it('permits verified safe engineering command', () => {
    const result = ClipboardHijackDataScraper.inspect('git status && npm run test');
    expect(result.isThreat).toBe(false);
    expect(ClipboardHijackDataScraper.validate('git status && npm run test')).toBe(true);
  });
});
