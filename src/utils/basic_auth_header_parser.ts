export class BasicAuthHeaderParser {
  public static parse(header?: string | null): { username: string; password: string } | null {
    if (!header || typeof header !== 'string') return null;
    const match = header.trim().match(/^basic\s+([a-zA-Z0-9+/=]+)$/i);
    if (!match) return null;

    try {
      const decoded = Buffer.from(match[1], 'base64').toString('utf-8');
      const colonIdx = decoded.indexOf(':');
      if (colonIdx === -1) return null;
      return {
        username: decoded.substring(0, colonIdx),
        password: decoded.substring(colonIdx + 1)
      };
    } catch {
      return null;
    }
  }
}
