export class UrlHostCanonicalizer {
  public static canonicalize(rawUrl: string): string {
    if (!rawUrl || typeof rawUrl !== 'string') return '';
    try {
      const parsed = new URL(rawUrl.trim());
      parsed.hostname = parsed.hostname.toLowerCase().replace(/\.+$/, '');
      if ((parsed.protocol === 'http:' && parsed.port === '80') || (parsed.protocol === 'https:' && parsed.port === '443')) {
        parsed.port = '';
      }
      return parsed.toString();
    } catch {
      return rawUrl.trim();
    }
  }
}
