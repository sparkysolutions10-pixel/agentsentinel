/**
 * AgentSentinel - String Length Ceiling Guard Utility
 * Bounds maximum string length and formats clean ellipsis previews.
 */

export class StringLengthCeilingGuard {
  public static isWithinCeiling(str: unknown, maxChars: number = 1000): boolean {
    if (typeof str !== 'string') return false;
    return str.length <= maxChars;
  }

  public static truncate(str: string, maxChars: number = 100, suffix: string = '...'): string {
    if (!str || typeof str !== 'string') return '';
    if (str.length <= maxChars) return str;
    const targetLen = Math.max(0, maxChars - suffix.length);
    return str.substring(0, targetLen) + suffix;
  }
}
