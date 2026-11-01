import { describe, it, expect } from 'vitest';
import { UnicodeHomoglyphDetector } from '../src/utils/unicode_homoglyph_detector.js';

describe('UnicodeHomoglyphDetector', () => {
  it('detects Cyrillic homoglyphs in spoofed strings', () => {
    const spoofed = 'p\u0430ypal.com'; // Cyrillic 'a'
    expect(UnicodeHomoglyphDetector.hasHomoglyphs(spoofed)).toBe(true);
    expect(UnicodeHomoglyphDetector.countHomoglyphs(spoofed)).toBe(1);
    expect(UnicodeHomoglyphDetector.normalize(spoofed)).toBe('paypal.com');
  });

  it('returns false for pure ASCII strings', () => {
    expect(UnicodeHomoglyphDetector.hasHomoglyphs('google.com')).toBe(false);
    expect(UnicodeHomoglyphDetector.countHomoglyphs('google.com')).toBe(0);
    expect(UnicodeHomoglyphDetector.normalize('google.com')).toBe('google.com');
  });
});
