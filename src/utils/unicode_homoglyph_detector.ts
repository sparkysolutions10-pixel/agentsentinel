/**
 * Detects Unicode homoglyphs and confusable characters used in spoofing attacks.
 */
export class UnicodeHomoglyphDetector {
  private static readonly HOMOGLYPH_MAP: Record<string, string> = {
    '\u0430': 'a', // Cyrillic small a
    '\u0435': 'e', // Cyrillic small ie
    '\u043E': 'o', // Cyrillic small o
    '\u0440': 'p', // Cyrillic small er
    '\u0441': 'c', // Cyrillic small es
    '\u0443': 'y', // Cyrillic small u
    '\u0445': 'x', // Cyrillic small ha
    '\u0456': 'i', // Cyrillic small i
    '\u0458': 'j', // Cyrillic small je
    '\u03BF': 'o', // Greek small omicron
    '\u03BD': 'v', // Greek small nu
  };

  public static hasHomoglyphs(input: string): boolean {
    if (!input || typeof input !== 'string') return false;
    for (const char of input) {
      if (this.HOMOGLYPH_MAP[char]) {
        return true;
      }
    }
    return false;
  }

  public static normalize(input: string): string {
    if (!input || typeof input !== 'string') return '';
    let result = '';
    for (const char of input) {
      result += this.HOMOGLYPH_MAP[char] || char;
    }
    return result;
  }

  public static countHomoglyphs(input: string): number {
    if (!input || typeof input !== 'string') return 0;
    let count = 0;
    for (const char of input) {
      if (this.HOMOGLYPH_MAP[char]) {
        count++;
      }
    }
    return count;
  }
}
