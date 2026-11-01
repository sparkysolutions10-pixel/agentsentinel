export class ZeroWidthSpaceScrubber {
  private static readonly ZERO_WIDTH_REGEX = /[\u200B\u200C\u200D\uFEFF\u2060\u200E\u200F]/g;

  public static scrub(input: string): string {
    if (!input || typeof input !== 'string') return '';
    return input.replace(this.ZERO_WIDTH_REGEX, '');
  }

  public static hasZeroWidth(input: string): boolean {
    if (!input || typeof input !== 'string') return false;
    return this.ZERO_WIDTH_REGEX.test(input);
  }
}
