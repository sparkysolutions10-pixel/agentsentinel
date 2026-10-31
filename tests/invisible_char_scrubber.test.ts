import { describe, it, expect } from 'vitest';
import { InvisibleCharScrubber } from '../src/utils/invisible_char_scrubber.js';

describe('InvisibleCharScrubber', () => {
  it('detects and strips zero-width spaces and joiners', () => {
    const malicious = 'H\u200Be\u200Cl\u200Dl\uFEFFo World';
    expect(InvisibleCharScrubber.hasInvisibleChars(malicious)).toBe(true);
    expect(InvisibleCharScrubber.scrub(malicious)).toBe('Hello World');
  });

  it('leaves clean text untouched', () => {
    expect(InvisibleCharScrubber.hasInvisibleChars('Clean Prompt Text')).toBe(false);
    expect(InvisibleCharScrubber.scrub('Clean Prompt Text')).toBe('Clean Prompt Text');
  });
});
