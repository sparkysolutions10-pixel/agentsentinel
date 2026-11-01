export class HttpBearerTokenExtractor {
  public static extract(authHeader?: string | null): string | null {
    if (!authHeader || typeof authHeader !== 'string') return null;
    const match = authHeader.trim().match(/^bearer\s+([a-zA-Z0-9._~+\/-]+=*)$/i);
    return match ? match[1] : null;
  }
}
