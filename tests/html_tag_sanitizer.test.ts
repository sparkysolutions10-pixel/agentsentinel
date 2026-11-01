import { describe, it, expect } from 'vitest';
import { HtmlTagSanitizer } from '../src/utils/html_tag_sanitizer.js';

describe('HtmlTagSanitizer', () => {
  it('escapes dangerous HTML characters', () => {
    const raw = '<script>alert("xss")</script>';
    expect(HtmlTagSanitizer.escape(raw)).toBe('&lt;script&gt;alert(&quot;xss&quot;)&lt;/script&gt;');
  });

  it('strips all HTML tags cleanly', () => {
    const raw = '<b>Bold</b> and <i>Italic</i>';
    expect(HtmlTagSanitizer.stripTags(raw)).toBe('Bold and Italic');
  });

  it('removes script blocks entirely', () => {
    const raw = 'Safe Text<script>evil()</script> More Safe';
    expect(HtmlTagSanitizer.stripScriptAndStyle(raw)).toBe('Safe Text More Safe');
  });
});
