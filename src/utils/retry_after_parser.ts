export class RetryAfterParser {
  public static parseToMs(header?: string | null, nowMs: number = Date.now()): number | null {
    if (!header || typeof header !== 'string') return null;
    const clean = header.trim();

    // Check integer seconds
    if (/^\d+$/.test(clean)) {
      const sec = parseInt(clean, 10);
      return Math.max(0, sec * 1000);
    }

    // Check HTTP Date
    const parsedDate = Date.parse(clean);
    if (!isNaN(parsedDate)) {
      return Math.max(0, parsedDate - nowMs);
    }

    return null;
  }
}
