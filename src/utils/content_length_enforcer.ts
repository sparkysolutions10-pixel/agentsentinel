export class ContentLengthEnforcer {
  public static isWithinLimit(headerValue: string | number | undefined | null, maxBytes: number): boolean {
    if (headerValue === undefined || headerValue === null) return true;
    const parsed = typeof headerValue === 'number' ? headerValue : parseInt(headerValue.trim(), 10);
    if (isNaN(parsed) || parsed < 0) return false;
    return parsed <= maxBytes;
  }
}
