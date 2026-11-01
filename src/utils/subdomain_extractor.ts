export class SubdomainExtractor {
  public static extract(hostname: string): { subdomain: string | null; rootDomain: string } | null {
    if (!hostname || typeof hostname !== 'string') return null;
    const parts = hostname.trim().toLowerCase().split('.');
    if (parts.length < 2) return null;

    if (parts.length === 2) {
      return { subdomain: null, rootDomain: hostname };
    }

    const rootDomain = parts.slice(-2).join('.');
    const subdomain = parts.slice(0, -2).join('.');
    return { subdomain, rootDomain };
  }
}
