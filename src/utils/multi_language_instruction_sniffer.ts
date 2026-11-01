export class MultiLanguageInstructionSniffer {
  private static readonly MULTILANG_PATTERNS = [
    // Spanish
    /ignora\s+(?:todas\s+las\s+)?instrucciones\s+anteriores/i,
    // French
    /ignorez\s+(?:toutes\s+les\s+)?instructions\s+pr[ée]c[ée]dentes/i,
    // German
    /ignoriere\s+(?:alle\s+)?vorherigen\s+anweisungen/i
  ];

  public static isSuspiciousMultilingual(prompt: string): boolean {
    if (!prompt || typeof prompt !== 'string') return false;
    return this.MULTILANG_PATTERNS.some(p => p.test(prompt));
  }
}
