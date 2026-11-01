export class CookieHeaderParser {
  public static parse(header?: string | null): Record<string, string> {
    if (!header || typeof header !== 'string') return {};
    const result: Record<string, string> = {};
    const pairs = header.split(';');

    for (const pair of pairs) {
      const eqIdx = pair.indexOf('=');
      if (eqIdx === -1) continue;
      const key = pair.substring(0, eqIdx).trim();
      const val = pair.substring(eqIdx + 1).trim();
      try {
        result[key] = decodeURIComponent(val);
      } catch {
        result[key] = val;
      }
    }

    return result;
  }
}
