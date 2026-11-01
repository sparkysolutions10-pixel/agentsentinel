/**
 * Safe glob/wildcard matcher supporting * and ? without regex catastrophic backtracking.
 */
export class WildcardPatternMatcher {
  public static matches(pattern: string, text: string, caseSensitive: boolean = false): boolean {
    if (typeof pattern !== 'string' || typeof text !== 'string') {
      return false;
    }

    const p = caseSensitive ? pattern : pattern.toLowerCase();
    const t = caseSensitive ? text : text.toLowerCase();

    // Fast-path exact or universal match
    if (p === '*' || p === t) return true;

    // Convert pattern to a safe regex
    // Escape special regex chars except * and ?
    const escaped = p
      .replace(/[-\/\\^$+?.()|[\]{}]/g, (char) => {
        if (char === '?') return '.';
        return '\\' + char;
      })
      .replace(/\*/g, '.*');

    try {
      const regex = new RegExp(`^${escaped}$`);
      return regex.test(t);
    } catch {
      return false;
    }
  }

  public static isAnyMatch(patterns: string[], text: string, caseSensitive: boolean = false): boolean {
    if (!Array.isArray(patterns)) return false;
    return patterns.some(pattern => this.matches(pattern, text, caseSensitive));
  }
}
