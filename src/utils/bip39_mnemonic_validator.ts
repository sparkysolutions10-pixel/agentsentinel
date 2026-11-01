export class Bip39MnemonicValidator {
  private static readonly VALID_LENGTHS = new Set([12, 15, 18, 21, 24]);

  public static isValid(phrase: string): boolean {
    if (!phrase || typeof phrase !== 'string') return false;
    const words = phrase.trim().toLowerCase().split(/\s+/);
    if (!this.VALID_LENGTHS.has(words.length)) {
      return false;
    }
    // Check that every word contains only lowercase a-z
    return words.every(w => /^[a-z]{3,8}$/.test(w));
  }

  public static getWordCount(phrase: string): number {
    if (!phrase || typeof phrase !== 'string') return 0;
    return phrase.trim().split(/\s+/).filter(Boolean).length;
  }
}
