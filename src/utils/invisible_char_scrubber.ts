/**
 * AgentSentinel - Invisible Character Scrubber Utility
 * Removes zero-width Unicode characters, joiners, and hidden whitespace bypass vectors.
 */

export class InvisibleCharScrubber {
  // ​ (ZWSP), ‌ (ZWNJ), ‍ (ZWJ), ﻿ (BOM), ⁠ (WJ), ­ (soft hyphen)
  private static readonly INVISIBLE_REGEX = /[\u200B\u200C\u200D\u200E\u200F\uFEFF\u2060\u00AD]/g;

  public static scrub(text: string): string {
    if (!text || typeof text !== 'string') return '';
    return text.replace(this.INVISIBLE_REGEX, '').replace(/\u00A0/g, ' ');
  }

  public static hasInvisibleChars(text: string): boolean {
    if (!text || typeof text !== 'string') return false;
    return this.INVISIBLE_REGEX.test(text);
  }
}
