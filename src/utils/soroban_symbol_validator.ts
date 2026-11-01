export class SorobanSymbolValidator {
  private static readonly SYMBOL_REGEX = /^[a-zA-Z0-9_]{1,32}$/;

  public static isValid(symbol: string): boolean {
    if (!symbol || typeof symbol !== 'string') return false;
    return this.SYMBOL_REGEX.test(symbol.trim());
  }
}
