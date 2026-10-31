/**
 * AgentSentinel - ISO-8601 Validator Utility
 * Validates ISO-8601 extended datetime strings and parses date representations safely.
 */

export class Iso8601Validator {
  private static readonly ISO_REGEX =
    /^\d{4}-\d{2}-\d{2}(?:T\d{2}:\d{2}:\d{2}(?:\.\d+)?(?:Z|[+-]\d{2}:?\d{2})?)?$/;

  public static isValid(timestamp: string): boolean {
    if (!timestamp || typeof timestamp !== 'string') return false;
    const clean = timestamp.trim();
    if (!this.ISO_REGEX.test(clean)) return false;
    const d = new Date(clean);
    if (isNaN(d.getTime())) return false;

    // Check month and day calendar bounds
    const [y, m, day] = clean.substring(0, 10).split('-').map(Number);
    if (m < 1 || m > 12) return false;
    const daysInMonth = new Date(Date.UTC(y, m, 0)).getUTCDate();
    if (day < 1 || day > daysInMonth) return false;

    return true;
  }

  public static parseDate(timestamp: string): Date | null {
    if (!this.isValid(timestamp)) return null;
    return new Date(timestamp.trim());
  }
}
