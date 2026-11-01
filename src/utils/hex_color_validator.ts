/**
 * Validates and normalizes hexadecimal color codes (#RGB, #RGBA, #RRGGBB, #RRGGBBAA).
 */
export class HexColorValidator {
  private static readonly HEX_COLOR_REGEX = /^#?([0-9a-fA-F]{3}|[0-9a-fA-F]{4}|[0-9a-fA-F]{6}|[0-9a-fA-F]{8})$/;

  public static isValid(hex: string): boolean {
    if (!hex || typeof hex !== 'string') return false;
    return this.HEX_COLOR_REGEX.test(hex.trim());
  }

  public static normalize(hex: string): string | null {
    if (!this.isValid(hex)) return null;
    let clean = hex.trim().replace(/^#/, '');

    if (clean.length === 3) {
      clean = clean.split('').map(c => c + c).join('');
    }

    return '#' + clean.toLowerCase();
  }
}
