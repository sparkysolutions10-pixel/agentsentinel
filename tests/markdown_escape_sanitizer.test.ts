import { describe, it, expect } from 'vitest';
import { MarkdownEscapeSanitizer } from '../src/utils/markdown_escape_sanitizer.js';

describe('MarkdownEscapeSanitizer', () => {
  it('escapes dangerous markdown syntax', () => {
    const raw = '# Title [Click Here](http://evil.com) *bold*';
    const escaped = MarkdownEscapeSanitizer.escape(raw);
    expect(escaped).toBe('\\# Title \\[Click Here\\]\\(http://evil\\.com\\) \\*bold\\*');
  });

  it('round-trips correctly through unescape', () => {
    const raw = 'Simple *text* with `code`';
    const escaped = MarkdownEscapeSanitizer.escape(raw);
    expect(MarkdownEscapeSanitizer.unescape(escaped)).toBe(raw);
  });
});
