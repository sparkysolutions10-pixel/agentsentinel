/**
 * AgentSentinel - Regex Pattern Validator Utility
 * Tests regular expression validity and screens against catastrophic backtracking (ReDoS) hazards.
 */

export class RegexPatternValidator {
  // Flag patterns with nested quantifiers: (a+)+ or ([a-z]*)*
  private static readonly REDOS_REGEX = /\([^)]*[+*][^)]*\)[+*]/;

  public static isValidPattern(pattern: string): boolean {
    if (!pattern || typeof pattern !== 'string') return false;
    try {
      new RegExp(pattern);
      return true;
    } catch {
      return false;
    }
  }

  public static isPotentialRedos(pattern: string): boolean {
    if (!this.isValidPattern(pattern)) return false;
    return this.REDOS_REGEX.test(pattern);
  }
}
